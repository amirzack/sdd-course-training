import test from 'node:test';
import assert from 'node:assert/strict';
import {createStore} from '../src/store.js';
import {createApp} from '../src/app.js';
async function fixture(t){
 const store=createStore(':memory:');
 const server=createApp(store);
 await new Promise(resolve=>server.listen(0,'127.0.0.1',resolve));
 t.after(async()=>{await new Promise(resolve=>server.close(resolve));store.close();});
 const base=`http://127.0.0.1:${server.address().port}`;
 const call=async(method,path,token='requester-token',body)=>{
   const response=await fetch(base+path,{method,headers:{authorization:`Bearer ${token}`,...(body!==undefined?{'content-type':'application/json'}:{})},...(body!==undefined?{body:JSON.stringify(body)}:{})});
   return {status:response.status,data:await response.json()};
 };
 const create=async(token='requester-token')=>(await call('POST','/requests',token,{title:'Feature A',description:'Add something',reason:'Needed'})).data;
 return {store,call,create};
}
test('creates a Draft owned by requester',async t=>{
 const {store,create}=await fixture(t);const r=await create();assert.equal(r.status,'Draft');assert.equal(r.requester_id,'ali');assert.equal(store.get(r.id).status,'Draft');
});
test('submit Draft to PendingReview',async t=>{
 const {store,call,create}=await fixture(t);const r=await create();const x=await call('POST',`/requests/${r.id}/submit`,'requester-token',{version:r.version});assert.equal(x.status,200);assert.equal(store.get(r.id).status,'PendingReview');
});
test('same user with both roles cannot approve own request',async t=>{
 const {store,call,create}=await fixture(t);const r=await create('both-token');const s=await call('POST',`/requests/${r.id}/submit`,'both-token',{version:r.version});const a=await call('POST',`/requests/${r.id}/approve`,'both-token',{version:s.data.version});assert.equal(a.status,403);assert.equal(store.get(r.id).status,'PendingReview');
});
test('independent reviewer can approve',async t=>{
 const {store,call,create}=await fixture(t);const r=await create();const s=await call('POST',`/requests/${r.id}/submit`,'requester-token',{version:r.version});const a=await call('POST',`/requests/${r.id}/approve`,'reviewer-token',{version:s.data.version});assert.equal(a.status,200);assert.equal(store.get(r.id).status,'Approved');
});
test('approved request cannot be edited and stays unchanged',async t=>{
 const {store,call,create}=await fixture(t);const r=await create();const s=await call('POST',`/requests/${r.id}/submit`,'requester-token',{version:r.version});const a=await call('POST',`/requests/${r.id}/approve`,'reviewer-token',{version:s.data.version});const x=await call('PATCH',`/requests/${r.id}`,'requester-token',{version:a.data.version,title:'Changed'});assert.equal(x.status,409);assert.equal(store.get(r.id).title,'Feature A');
});
test('old version cannot silently overwrite newer edit',async t=>{
 const {store,call,create}=await fixture(t);const r=await create();const first=await call('PATCH',`/requests/${r.id}`,'requester-token',{version:r.version,title:'Latest'});assert.equal(first.status,200);const old=await call('PATCH',`/requests/${r.id}`,'requester-token',{version:r.version,title:'Stale'});assert.equal(old.status,409);assert.equal(store.get(r.id).title,'Latest');
});
test('request changes then submit again',async t=>{
 const {store,call,create}=await fixture(t);const r=await create();const s=await call('POST',`/requests/${r.id}/submit`,'requester-token',{version:r.version});const back=await call('POST',`/requests/${r.id}/request-changes`,'reviewer-token',{version:s.data.version});assert.equal(back.data.status,'ChangesRequested');const edit=await call('PATCH',`/requests/${r.id}`,'requester-token',{version:back.data.version,reason:'More detail'});const x=await call('POST',`/requests/${r.id}/submit`,'requester-token',{version:edit.data.version});assert.equal(x.status,200);assert.equal(store.get(r.id).status,'PendingReview');
});
test('anonymous denied and reviewer cannot edit another request',async t=>{
 const {store,call,create}=await fixture(t);const r=await create();assert.equal((await call('GET',`/requests/${r.id}`,'bad-token')).status,401);assert.equal((await call('PATCH',`/requests/${r.id}`,'reviewer-token',{version:r.version,title:'Bad edit'})).status,403);assert.equal(store.get(r.id).title,'Feature A');
});
