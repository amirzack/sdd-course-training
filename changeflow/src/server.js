import { createStore } from './store.js';
import { createApp } from './app.js';
const store=createStore(process.env.DB_FILE||'changeflow.sqlite');
const port=Number(process.env.PORT||3000);
const server=createApp(store);
server.listen(port,()=>console.log(`ChangeFlow listening on http://localhost:${port}`));
process.on('SIGINT',()=>{server.close();store.close();});
