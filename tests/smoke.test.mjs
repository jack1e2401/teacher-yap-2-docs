import test from 'node:test';
import assert from 'node:assert/strict';
import { existsSync, readFileSync } from 'node:fs';
const base='http://localhost:3000';
const envFile = new URL('../.env.local', import.meta.url);
const hasKey = existsSync(envFile) && /^DEEPSEEK_API_KEY\s*=\s*\S+/m.test(readFileSync(envFile, 'utf8'));
test('trang chính và ba tab được phục vụ',async()=>{const r=await fetch(base);assert.equal(r.status,200);const html=await r.text();for(const text of ['Soạn bài','Tạo slide','Viết SKKN'])assert.ok(html.includes(text));});
test('trang hướng dẫn có lối vào từ trang chính và đủ các chế độ',async()=>{
 const home=await (await fetch(base)).text();assert.match(home,/href="\/huong-dan"/);
 const response=await fetch(base+'/huong-dan');assert.equal(response.status,200);
 const html=await response.text();for(const title of ['Kế hoạch bài dạy','Bài kiểm tra','Tạo slide','Viết bản dự thảo SKKN','Lỗi thường gặp'])assert.ok(html.includes(title),title);
});
test('thiếu key trả thông báo rõ',{skip:hasKey?'Máy đang cấu hình API key.':false},async()=>{const r=await fetch(base+'/api/generate',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({kind:'slide',source:'Bài học'})});assert.equal(r.status,503);assert.match((await r.json()).error,/chưa cấu hình/i);});
test('xuất PowerPoint và Word có dữ liệu ZIP',async()=>{
 const common={subject:'Tiếng Anh',grade:6,book:'',title:'My New School',duration:45,goals:'',source:'',scope:'',points:10,questionCount:5,questionTypes:'',slideCount:10,problem:'',measures:'',evidence:''};
 const cases=[['slide',{title:'My New School',slides:Array.from({length:10},(_,i)=>({title:'Giới thiệu '+i,bullets:['Trường học'],speakerNotes:'Ghi chú'}))}],['skkn',{title:'Bản dự thảo',introduction:'a',basis:'b',situation:'c',measures:'d',evaluation:'e',applicability:'f',conclusion:'g',recommendations:'h'}]];
 for(const [kind,result] of cases){const r=await fetch(base+'/api/export',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({input:{...common,kind},result})});assert.equal(r.status,200);const bytes=new Uint8Array(await r.arrayBuffer());assert.equal(String.fromCharCode(...bytes.slice(0,2)),'PK');assert.ok(bytes.length>1000);}
});
test('đầu vào xuất file sai bị từ chối',async()=>{const r=await fetch(base+'/api/export',{method:'POST',headers:{'Content-Type':'application/json'},body:'{}'});assert.equal(r.status,400);});
