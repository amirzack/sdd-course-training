import { DatabaseSync } from 'node:sqlite';
export function createStore(filename = 'changeflow.sqlite') {
  const db = new DatabaseSync(filename);
  db.exec(`PRAGMA journal_mode = WAL;
    CREATE TABLE IF NOT EXISTS requests (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    title TEXT NOT NULL, description TEXT NOT NULL, reason TEXT NOT NULL,
    requester_id TEXT NOT NULL,
    status TEXT NOT NULL CHECK (status IN ('Draft','PendingReview','ChangesRequested','Approved')),
    version INTEGER NOT NULL DEFAULT 1, created_at TEXT NOT NULL, updated_at TEXT NOT NULL);`);
  const get = db.prepare('SELECT * FROM requests WHERE id = ?');
  return {
    create({title, description, reason, requesterId}) {
      const now = new Date().toISOString();
      const r = db.prepare('INSERT INTO requests (title,description,reason,requester_id,status,version,created_at,updated_at) VALUES (?,?,?,?,?,1,?,?)').run(title,description,reason,requesterId,'Draft',now,now);
      return get.get(Number(r.lastInsertRowid));
    },
    get(id) { return get.get(id); },
    list(requesterId, all) { return all ? db.prepare('SELECT * FROM requests ORDER BY id DESC').all() : db.prepare('SELECT * FROM requests WHERE requester_id=? ORDER BY id DESC').all(requesterId); },
    edit({id,version,title,description,reason,status}) {
      const r=db.prepare('UPDATE requests SET title=?,description=?,reason=?,version=version+1,updated_at=? WHERE id=? AND version=? AND status=?').run(title,description,reason,new Date().toISOString(),id,version,status);
      return r.changes===1 ? get.get(id) : null;
    },
    move({id,version,from,to}) {
      const r=db.prepare('UPDATE requests SET status=?,version=version+1,updated_at=? WHERE id=? AND version=? AND status=?').run(to,new Date().toISOString(),id,version,from);
      return r.changes===1 ? get.get(id) : null;
    },
    close() { db.close(); }
  };
}
