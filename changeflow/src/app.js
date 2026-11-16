import http from 'node:http';
// Classroom demo only: replace these tokens with real authentication before deployment.
const demoUsers = new Map([
  ['requester-token', {id:'ali',roles:['Requester']}],
  ['reviewer-token', {id:'sara',roles:['Reviewer']}],
  ['both-token', {id:'reza',roles:['Requester','Reviewer']}]
]);
const send=(res,code,data)=>{res.writeHead(code,{'content-type':'application/json; charset=utf-8'});res.end(JSON.stringify(data));};
const validText=x=>typeof x==='string'&&x.trim().length>0;
const validVersion=x=>Number.isSafeInteger(x)&&x>0;
async function readBody(req) {
  let body='';
  for await (const part of req) {
    body+=part;
    if(body.length>32000)throw Object.assign(new Error('Body too large'),{status:413});
  }
  try{return body?JSON.parse(body):{};}
  catch {throw Object.assign(new Error('Invalid JSON'),{status:400});}
}
export function createApp(store) {
  return http.createServer(async(req,res)=>{
    try {
      const url=new URL(req.url,'http://localhost');
      if(req.method==='GET'&&url.pathname==='/health')return send(res,200,{ok:true});
      const token=(req.headers.authorization||'').replace(/^Bearer\s+/i,'');
      const user=demoUsers.get(token);
      if(!user)return send(res,401,{error:'Authentication required'});
      const role=name=>user.roles.includes(name);
      if(req.method==='POST'&&url.pathname==='/requests') {
        if(!role('Requester'))return send(res,403,{error:'Requester role required'});
        const body=await readBody(req);
        if(![body.title,body.description,body.reason].every(validText))return send(res,400,{error:'title, description and reason are required'});
        return send(res,201,store.create({title:body.title.trim(),description:body.description.trim(),reason:body.reason.trim(),requesterId:user.id}));
      }
      if(req.method==='GET'&&url.pathname==='/requests')return send(res,200,store.list(user.id,role('Reviewer')));
      const match=url.pathname.match(/^\/requests\/(\d+)(?:\/(submit|approve|request-changes))?$/);
      if(!match)return send(res,404,{error:'Not found'});
      const id=Number(match[1]);
      if(!Number.isSafeInteger(id))return send(res,404,{error:'Not found'});
      const existing=store.get(id);
      if(!existing)return send(res,404,{error:'Request not found'});
      if(req.method==='GET'&&!match[2]){
        if(existing.requester_id!==user.id&&!role('Reviewer'))return send(res,403,{error:'Forbidden'});
        return send(res,200,existing);
      }
      const isOwner=existing.requester_id===user.id;
      if(req.method==='PATCH'&&!match[2]){
        if(!isOwner||!role('Requester'))return send(res,403,{error:'Only the requester can edit'});
        if(!['Draft','ChangesRequested'].includes(existing.status))return send(res,409,{error:'Request cannot be edited in this state'});
        const body=await readBody(req);
        if(!validVersion(body.version))return send(res,400,{error:'Valid version required'});
        if(body.version!==existing.version)return send(res,409,{error:'Version conflict'});
        const data={title:body.title??existing.title,description:body.description??existing.description,reason:body.reason??existing.reason};
        if(!Object.values(data).every(validText))return send(res,400,{error:'Fields must be non-empty'});
        const updated=store.edit({id,version:body.version,status:existing.status,...data});
        return updated?send(res,200,updated):send(res,409,{error:'Version or state conflict'});
      }
      if(req.method==='POST'&&match[2]){
        const action=match[2];
        if(action==='submit'&&(!isOwner||!role('Requester')))return send(res,403,{error:'Only the requester can submit'});
        if(action!=='submit'&&!role('Reviewer'))return send(res,403,{error:'Reviewer role required'});
        if(action!=='submit'&&isOwner)return send(res,403,{error:'Self-approval/review is not allowed'});
        const from=action==='submit'?['Draft','ChangesRequested']:['PendingReview'];
        if(!from.includes(existing.status))return send(res,409,{error:'Invalid status transition'});
        const body=await readBody(req);
        if(!validVersion(body.version))return send(res,400,{error:'Valid version required'});
        if(body.version!==existing.version)return send(res,409,{error:'Version conflict'});
        const to={submit:'PendingReview',approve:'Approved','request-changes':'ChangesRequested'}[action];
        const updated=store.move({id,version:body.version,from:existing.status,to});
        return updated?send(res,200,updated):send(res,409,{error:'Version or state conflict'});
      }
      return send(res,404,{error:'Not found'});
    }catch(err){return send(res,err.status||500,{error:err.status?err.message:'Internal error'});}
  });
}
