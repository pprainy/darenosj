const $ = (s, r=document) => r.querySelector(s);
const $$ = (s, r=document) => [...r.querySelectorAll(s)];
const lockScreen=$('#lockScreen'), homeScreen=$('#homeScreen'), pagesContainer=$('#pagesContainer');
const passcodeOverlay=$('#passcodeOverlay'), passcodeDots=$('#passcodeDots').children, passcodeError=$('#passcodeError');
const keypad=$('.keypad'), appView=$('#appView'), appTitle=$('#appTitle'), appContent=$('#appContent'), dots=$$('.dot');
const STORE='ryryry-simulator-v3-content';
const saved = (()=>{try{return JSON.parse(localStorage.getItem(STORE))||{}}catch(e){return {}}})();
const persist=()=>{try{localStorage.setItem(STORE,JSON.stringify(saved))}catch(e){}};
// 首次打开时填充可编辑的中文演示内容；用户已有数据不会被覆盖。
const demoData={
 notes:[
  {title:'周末想做的事',body:`☕ 找一家喜欢的咖啡店\n📷 整理最近拍的照片\n🎧 听完收藏的歌单`,date:'今天'},
  {title:'随手记',body:'慢一点也没关系，把喜欢的日常认真记录下来。',date:'昨天'}
 ],
 contacts:[
  {name:'妈妈',phone:'138 0000 0001',note:'家人'}
 ],
 messages:[
  {to:'小雨',body:'到家跟我说一声呀～',date:'今天 21:18'},
  {to:'妈妈',body:'周末有空的话给你打电话。',date:'今天 18:42'},
  {to:'林同学',body:'照片我整理好再发给你！',date:'昨天 16:20'}
 ],
 mail:[
  {to:'自己',body:'周末计划：整理照片、听歌、出门走走。',date:'今天 09:30'},
  {to:'小雨',body:`主题：上次拍的照片\n我先把照片整理一下，晚点发你。`,date:'昨天 20:15'}
 ],
 kakaotalk:[
  {to:'지민 / 智敏',body:'오늘 뭐 해? 😊（今天做什么呀？）',date:'今天 20:35'},
  {to:'친구들 / 好友群',body:'周末一起去喝咖啡吗？',date:'今天 17:06'}
 ],
 'posts_instagram':[
  {title:'最近的日常 📷',body:'一些普通但很喜欢的瞬间。生活碎片慢慢收集。',image:'',likes:24},
  {title:'☁️ 慢慢来',body:'把今天也过成自己喜欢的样子。',image:'',likes:16}
 ],
 'posts_x':[
  {title:'随手记录',body:'希望最近的每一天，都有一点小小的开心。',image:'',likes:8},
  {title:'今天',body:'听着喜欢的歌走路，感觉时间都变慢了。',image:'',likes:12}
 ],
 'posts_xiaohongshu':[
  {title:'我的日常碎片｜最近喜欢的生活节奏',body:`不赶时间，出门走走，拍几张喜欢的照片，再找个地方喝咖啡。\n普通日子也值得被记录 ✨`,image:'',likes:36},
  {title:'📸 手机相册里的小确幸',body:'随手拍下的光影、街角和天空，回头看都变成了很可爱的回忆。',image:'',likes:21}
 ],
 events:[
  {title:'整理相册',date:'今天 16:00'},
  {title:'和朋友喝咖啡',date:'明天 14:30'}
 ],
 photos:[1,2,3,4,5,6,7].map(n=>({data:`photos/${n}.jpg`,demo:true}))
};
Object.entries(demoData).forEach(([key,value])=>{if(!Object.prototype.hasOwnProperty.call(saved,key))saved[key]=value});
 // Add requested calendar events once, without duplicating them on later launches.
 saved.events=saved.events||[];
 if(!saved.events.some(ev=>ev.id==='brother-birthday-2026'||(ev.title==='哥哥生日💝'&&(ev.date||'').slice(0,10)==='2026-11-07'))){
  saved.events.push({id:'brother-birthday-2026',title:'哥哥生日💝',date:'2026-11-07'});
 }
 if(!saved.events.some(ev=>ev.id==='new-year-birthday-2027'||(ev.title==='又大一岁🎂'&&(ev.date||'').slice(0,10)==='2027-01-05'))){
  saved.events.push({id:'new-year-birthday-2027',title:'又大一岁🎂',date:'2027-01-05'});
 }
 // Keep the calendar on its normal current-date default; do not jump to the new event.
 persist();
// 统一所有应用使用的十位联系人；已有的号码和备注尽量保留。
const canonicalContacts=[
 ['申惟哥哥','010-2301-0001','哥哥'],['道勋哥','010-2301-0002','哥哥'],['英宰哥','010-2301-0003','哥哥'],['志薰🪼','010-2301-0004','朋友'],['炅潣','010-2301-0005','朋友'],
 ['爸爸','010-2301-0006','家人'],['妈妈','010-2301-0007','家人'],['弟弟','010-2301-0008','家人'],['小弟','010-2301-0009','家人'],['姐姐','010-2301-0010','家人']
];
const oldContacts=Array.isArray(saved.contacts)?saved.contacts:[];
const canonicalNames=new Set(canonicalContacts.map(([name])=>name));
// Match legacy contacts by name rather than array position, and retain user-created contacts.
saved.contacts=canonicalContacts.map(([name,phone,note])=>{
 const prior=oldContacts.find(contact=>contact?.name===name)||{};
 return {...prior,name,phone:prior.phone||phone,note:name==='申惟哥哥'?'哥哥':prior.note||note};
});
saved.contacts.push(...oldContacts.filter(contact=>contact?.name&&!canonicalNames.has(contact.name)&&!['小雨','阿哲','林同学'].includes(contact.name)));
// Remove unintended placeholder people from legacy seeded data, too.
['小雨','阿哲','林同学'].forEach(name=>{saved.contacts=saved.contacts.filter(c=>c.name!==name);['messages','mail','kakaotalk','wechat'].forEach(key=>{if(Array.isArray(saved[key]))saved[key]=saved[key].filter(row=>row.to!==name&&row.name!==name)});});
const conversationSeeds=[
 ['申惟哥哥','오늘 뭐 해? 사진 보내줄게.','刚刚','사진 보내줄게.'],['道勋哥','집 도착하면 알려줘!','10:42','집 도착하면 알려줘!'],['英宰哥','주말에 같이 밥 먹을래?','昨天','같이 밥 먹을래?'],['志薰🪼','ㅋㅋㅋ 방금 영상 진짜 웃겨','昨天','방금 영상 진짜 웃겨'],['炅潣','사진 너무 잘 나왔다!','周一','사진 너무 잘 나왔다!'],['爸爸','밥 잘 챙겨 먹어.','周日','밥 잘 챙겨 먹어.'],['妈妈','시간 되면 전화해 줘.','周日','전화해 줘.'],['弟弟','오늘 밤 게임할래?','周六','게임할래?'],['小弟','링크 보냈어! 확인해 봐.','周五','링크 보냈어!'],['姐姐','요즘 추우니까 따뜻하게 입어.','周四','따뜻하게 입어.']
];
for(const key of ['messages','kakaotalk']){
 const old=Array.isArray(saved[key])?saved[key]:[];
 // 只按联系人姓名匹配旧会话，绝不按数组序号套用别人的消息。
 saved[key]=conversationSeeds.map(([to,body,date,last])=>{
  const prior=old.find(x=>x.to===to)||{};
  const thread=Array.isArray(prior.thread)&&prior.thread.length
    ? prior.thread
    : [{from:'them',text:prior.body||body,date:prior.date||date}];
  const latest=thread[thread.length-1]||{};
  return {...prior,to,thread,body:latest.text||prior.body||body,date:latest.date||prior.date||date};
 });
}
// 微信承接家庭联系人；从旧版 KakaoTalk 会话中迁移原有聊天记录，避免丢失。
const familyNames=['爸爸','妈妈','弟弟','小弟','姐姐'];
const kakaoRows=Array.isArray(saved.kakaotalk)?saved.kakaotalk:[];
const wechatRows=Array.isArray(saved.wechat)?saved.wechat:[];
for(const name of familyNames){
 const fromKakao=kakaoRows.find(x=>x.to===name);
 const seed=conversationSeeds.find(x=>x[0]===name);
 const existing=wechatRows.find(x=>x.to===name);
 if(!existing){
  const source=fromKakao||{};
  const thread=Array.isArray(source.thread)&&source.thread.length?source.thread:[{from:'them',text:source.body||seed?.[1]||'你好',date:source.date||seed?.[2]||'今天'}];
  const latest=thread[thread.length-1]||{};
  wechatRows.push({...source,to:name,thread,body:latest.text||source.body||seed?.[1]||'',date:latest.date||source.date||seed?.[2]||'今天'});
 }
}
saved.wechat=wechatRows;
saved.kakaotalk=kakaoRows.filter(x=>!familyNames.includes(x.to));

/* Keep Shinyu's latest reference conversation in sync before lock-screen and chat-list previews render. */
{
 const shinyu=(saved.kakaotalk||[]).find(x=>x.to==='申惟哥哥');
 if(shinyu&&shinyu.demoHistoryVersion!==7){
  shinyu.thread=[
   {from:'me',text:'형 오늘 몇 시에 집에 가요?',translation:'哥哥你今天几点回家？',date:'16:13'},
   {from:'them',text:'여섯 시 조금 넘어서? 왜?',translation:'六点多吧，怎么了？',date:'16:14'},
   {from:'me',text:'내가 데리러 갈게!',translation:'我去接你吧！',date:'16:14'},
   {from:'them',text:'ㅋㅋㅋ 갑자기 왜?',translation:'ㅋㅋㅋ怎么突然',date:'16:14'},
   {from:'them',text:'형 보고 싶었어?',translation:'想哥哥了？',date:'16:14'},
   {from:'me',text:'응, 형 너무 보고 싶어🥺',translation:'对呀好想哥哥🥺',date:'16:16'},
   {from:'me',text:'하루 못 봤다고 삼 년 같아',translation:'一日不见如隔三秋',date:'16:16'},
   {from:'them',text:'한진……',translation:'韩振……',date:'16:17'},
   {from:'them',text:'헤어진 지 12시간도 안 됐는데',translation:'分开都没有12小时呢',date:'16:17'},
   {from:'them',text:'오늘 수업 없어?',translation:'今天没课了？',date:'16:17'},
   {from:'me',text:'응응',translation:'嗯嗯',date:'16:18'},
   {from:'me',text:'회사 건물 아래에서 보자~ (｡-.-｡)',translation:'你公司楼下见～(｡-.-｡)',date:'16:18'},
   {from:'me',text:'사랑해',translation:'爱你',date:'16:19'},
   {from:'them',text:'응',translation:'好',date:'16:19'},
   {from:'them',text:'나도 사랑해',translation:'我也爱你',date:'16:19'},
   {from:'me',text:'내가 더 사랑해!',translation:'我更爱你！',date:'16:19'},
   {from:'them',text:'……',translation:'……',date:'16:19'},
   {from:'them',type:'voice',text:'语音消息',date:'16:19',src:'assets/kakaotalk/voice/chat-voice-01.mp3',transcript:'就这么喜欢哥哥吗？真是疯了。'}
  ];
  shinyu.demoHistoryVersion=7;
  const last=shinyu.thread[shinyu.thread.length-1];
  shinyu.body=last.text;shinyu.date=last.date;
  persist();
 }
}

// 搜索历史默认四条；显式清空后不自动补回。
if(!Array.isArray(saved.xhsSearchHistory))saved.xhsSearchHistory=[];
if(saved.xhsSearchHistory.length===0&&saved.xhsSearchHistoryCleared!==true){saved.xhsSearchHistory=['哥哥太受欢迎了不开心是正常的吗','韩国打卡地点推荐','礼山','太喜欢哥哥了怎么办'];}
persist();
const esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const avatarFiles={'hanjin':'avatar.jpg','申惟哥哥':'shinyu.jpg','道勋哥':'dohoon.jpg','英宰哥':'youngjae.jpg','志薰🪼':'jihoon.jpg','炅潣':'kyungmin.jpg'};
function avatarMarkup(name,cls='contact-avatar'){const file=avatarFiles[name];return file?`<span class="${cls} has-photo"><img src="avatars/${file}" alt="${esc(name)}" onerror="this.parentElement.classList.remove('has-photo');this.remove()"><i>${esc((name||'?').slice(0,1))}</i></span>`:`<span class="${cls}">${esc((name||'?').slice(0,1))}</span>`;}
function updateLockKakaoNotification(){const list=saved.kakaotalk||[], item=list.find(x=>x.to==='申惟哥哥')||list[0], thread=Array.isArray(item?.thread)?item.thread:[], latest=[...thread].reverse().find(m=>m&&m.text), sender=item?.to||'KakaoTalk', preview=latest?.type==='voice'?'语音消息':latest?.text||item?.body||'你有一条新消息', messageTime=latest?.date||item?.date||'';const nameEl=$('#lockKakaoSender'),previewEl=$('#lockKakaoPreview'),timeEl=$('#lockKakaoTime');if(nameEl)nameEl.textContent=sender;if(previewEl)previewEl.textContent=preview;if(timeEl)timeEl.textContent=messageTime;const card=$('#lockKakaoNotification');if(card)card.hidden=!item;}
updateLockKakaoNotification();
const appNames={messages:'信息',mail:'邮件',notes:'备忘录',camera:'相机',instagram:'Instagram',browser:'浏览器',settings:'设置',x:'X',kakaotalk:'KakaoTalk',wechat:'微信',phone:'电话',xiaohongshu:'小红书',voice:'语音备忘录',photos:'照片',contacts:'通讯录',calendar:'日历'};
const icons={messages:'💬',mail:'✉️',notes:'📝',camera:'📷',instagram:'📸',browser:'🧭',settings:'⚙️',x:'𝕏',kakaotalk:'🟡',wechat:'🟢',phone:'📞',xiaohongshu:'📕',voice:'🎙️',photos:'🌄',contacts:'👤',calendar:'📅'};
let currentApp='', currentPasscode='', pendingLockKakaoOpen=false;
const correctPasscode='1107';
function showPasscode(){
 if(!lockScreen.classList.contains('active') || passcodeOverlay.classList.contains('show')) return;
 passcodeError.classList.remove('show');
 passcodeOverlay.classList.add('show');
}
function resetPasscode(){currentPasscode='';updateDots()}
function hidePasscode(){passcodeOverlay.classList.remove('show');passcodeError.classList.remove('show');resetPasscode()}
// 点按或向上滑动都可调出密码键盘，兼容手机触摸和桌面鼠标。
let lockGestureStart=null;
lockScreen.addEventListener('touchstart',e=>{
 if(passcodeOverlay.classList.contains('show') || e.target.closest('.lock-bottom-actions,.passcode-overlay')) return;
 const t=e.changedTouches[0]; lockGestureStart={x:t.clientX,y:t.clientY};
},{passive:true});
lockScreen.addEventListener('touchend',e=>{
 if(!lockGestureStart) return;
 const t=e.changedTouches[0], dx=t.clientX-lockGestureStart.x, dy=t.clientY-lockGestureStart.y;
 lockGestureStart=null;
 if(dy < -35 && Math.abs(dy)>Math.abs(dx)*1.15) showPasscode();
},{passive:true});
let lockPointerStart=null;
lockScreen.addEventListener('pointerdown',e=>{
 if(e.pointerType==='touch' || passcodeOverlay.classList.contains('show') || e.target.closest('.lock-bottom-actions,.passcode-overlay')) return;
 lockPointerStart={x:e.clientX,y:e.clientY};
});
lockScreen.addEventListener('pointerup',e=>{
 if(!lockPointerStart) return;
 const dx=e.clientX-lockPointerStart.x, dy=e.clientY-lockPointerStart.y; lockPointerStart=null;
 if(dy < -35 && Math.abs(dy)>Math.abs(dx)*1.15) showPasscode();
});
$('.lock-content')?.addEventListener('click',e=>{if(!e.target.closest('.lock-hint')) showPasscode()});
$('.lock-hint')?.addEventListener('click',showPasscode);
$('#lockKakaoNotification')?.addEventListener('click',e=>{e.stopPropagation();pendingLockKakaoOpen=true;showPasscode()});
$('#btnFlashlight')?.addEventListener('click',e=>{e.stopPropagation();toast('手电筒快捷入口（网页无法控制真实闪光灯）')});
$('#btnCamera')?.addEventListener('click',e=>{e.stopPropagation();openApp('camera')});
keypad?.addEventListener('click',e=>{const b=e.target.closest('.key');if(!b||b.classList.contains('key-empty'))return;if(b.id==='keyDelete')currentPasscode=currentPasscode.slice(0,-1);else if(currentPasscode.length<4)currentPasscode+=b.dataset.key;updateDots();if(currentPasscode.length===4)setTimeout(checkPasscode,180)});
function updateDots(){[...passcodeDots].forEach((d,i)=>d.classList.toggle('filled',i<currentPasscode.length))}
function checkPasscode(){if(currentPasscode===correctPasscode){hidePasscode();lockScreen.classList.remove('active');homeScreen.classList.add('active');if(pendingLockKakaoOpen){pendingLockKakaoOpen=false;setTimeout(()=>openApp('kakaotalk'),120)}}else{passcodeError.classList.add('show');keypad.classList.add('shake');setTimeout(()=>{passcodeError.classList.remove('show');keypad.classList.remove('shake');resetPasscode()},650)}}
function toast(message){let t=$('#simToast');if(!t){t=document.createElement('div');t.id='simToast';t.className='sim-toast';document.body.append(t)}t.textContent=message;t.classList.add('show');clearTimeout(window.__toastTimer);window.__toastTimer=setTimeout(()=>t.classList.remove('show'),2200)}
let currentPage=0;const totalPages=2;
function updatePageIndicator(){pagesContainer.style.transform=`translateX(-${currentPage*50}%)`;dots.forEach((d,i)=>d.classList.toggle('active',i===currentPage))}
dots.forEach(d=>d.addEventListener('click',()=>{currentPage=Number(d.dataset.page);updatePageIndicator()}));
let startX=0,isSwiping=false;
const startSwipe=x=>{startX=x;isSwiping=true},endSwipe=x=>{if(!isSwiping)return;isSwiping=false;const delta=startX-x;if(Math.abs(delta)>55){currentPage=Math.max(0,Math.min(totalPages-1,currentPage+(delta>0?1:-1)));updatePageIndicator()}};
homeScreen.addEventListener('touchstart',e=>{if(!e.target.closest('.app-item,.widget,.dot'))startSwipe(e.touches[0].clientX)},{passive:true});
homeScreen.addEventListener('touchend',e=>endSwipe(e.changedTouches[0].clientX),{passive:true});
homeScreen.addEventListener('mousedown',e=>{if(!e.target.closest('.app-item,.widget,.dot'))startSwipe(e.clientX)});
window.addEventListener('mouseup',e=>endSwipe(e.clientX));
// Long-press drag-and-drop for home screen icons.
let pressTimer=null,dragItem=null,dragging=false,dragStart=null,suppressAppClick=false,editMode=false;
function stopPressTimer(){if(pressTimer){clearTimeout(pressTimer);pressTimer=null}}
function persistIconOrder(){try{const order={};$$('.page').forEach((page,i)=>order['page'+(i+1)]=$$('.app-grid .app-item[data-app]',page).map(el=>el.dataset.app));order.dock=$$('.dock .app-item[data-app]').map(el=>el.dataset.app);localStorage.setItem('ryryry-icon-order',JSON.stringify(order))}catch(e){}}
function restoreIconOrder(){try{const order=JSON.parse(localStorage.getItem('ryryry-icon-order')||'null');if(!order)return;Object.entries(order).forEach(([key,apps])=>{const container=key==='dock'?$('.dock'):$(`#${key} .app-grid`);if(!container||!Array.isArray(apps))return;container.querySelectorAll('.app-item-empty').forEach(el=>el.remove());apps.forEach(app=>{const item=$$(`.app-item[data-app="${app}"]`).find(el=>container.contains(el));if(item)container.appendChild(item)})})}catch(e){}}
restoreIconOrder();
homeScreen.addEventListener('pointerdown',e=>{const item=e.target.closest('.app-item[data-app]');if(!item||e.button!==0)return;stopPressTimer();dragStart={x:e.clientX,y:e.clientY};pressTimer=setTimeout(()=>{editMode=true;dragItem=item;dragging=true;item.classList.add('is-dragging');toast('图标整理中：拖动图标调整位置')},380)},{passive:true});
homeScreen.addEventListener('pointermove',e=>{if(!dragStart)return;if(!dragging&&Math.hypot(e.clientX-dragStart.x,e.clientY-dragStart.y)>10)stopPressTimer();if(!dragging||!dragItem)return;e.preventDefault();const target=document.elementFromPoint(e.clientX,e.clientY)?.closest('.app-item[data-app]');if(target&&target!==dragItem&&target.parentElement===dragItem.parentElement){const rect=target.getBoundingClientRect();dragItem.parentElement.insertBefore(dragItem,e.clientY<rect.top+rect.height/2?target:target.nextSibling)}},{passive:false});
function finishIconDrag(){stopPressTimer();if(dragItem){dragItem.classList.remove('is-dragging');dragItem=null}if(dragging){dragging=false;editMode=false;suppressAppClick=true;setTimeout(()=>suppressAppClick=false,280);persistIconOrder()}dragStart=null}
homeScreen.addEventListener('pointerup',()=>{if(dragging)finishIconDrag();else{stopPressTimer();dragStart=null}},{passive:true});
homeScreen.addEventListener('pointercancel',()=>{if(dragging)finishIconDrag();else{stopPressTimer();dragStart=null}},{passive:true});
homeScreen.addEventListener('click',e=>{const item=e.target.closest('.app-item[data-app]');if(!item)return;e.stopPropagation();if(suppressAppClick)return;openApp(item.dataset.app)});
$('.widget-calendar')?.addEventListener('click',()=>openApp('calendar'));
function closeApp(){if(document.querySelector('#kakaoVoiceCallOverlay'))finishKakaoVoiceCall();appView.classList.remove('open');appView.removeAttribute('data-app');currentApp='';activeChat=null;}
$('#backBtn').addEventListener('click',closeApp);
function openApp(name){if(document.querySelector('#kakaoVoiceCallOverlay'))finishKakaoVoiceCall();currentApp=name;appView.dataset.app=name;appTitle.textContent=appNames[name]||name;renderApp(name);appView.classList.add('open');}
window.addEventListener('keydown',e=>{if(e.key==='Escape'&&appView.classList.contains('open'))closeApp()});
function actionButton(label,action,cls=''){return `<button class="sim-btn ${cls}" data-action="${action}">${label}</button>`}
function field(label,id,value='',placeholder=''){return `<label class="sim-field">${label}<input id="${id}" value="${esc(value)}" placeholder="${esc(placeholder)}"></label>`}
function emptyState(icon,title,desc=''){return `<div class="sim-empty"><div>${icon}</div><strong>${title}</strong><p>${desc}</p></div>`}
let activeChat=null;
const kakaoChinese={'오늘 뭐 해? 사진 보내줄게.':'今天在做什么？我给你发照片。','집 도착하면 알려줘!':'到家告诉我！','주말에 같이 밥 먹을래?':'周末一起吃饭吗？','ㅋㅋㅋ 방금 영상 진짜 웃겨':'哈哈，刚才的视频真的好好笑。','사진 너무 잘 나왔다!':'照片拍得真好！','밥 잘 챙겨 먹어.':'好好吃饭。','시간 되면 전화해 줘.':'有空给我打电话。','오늘 밤 게임할래?':'今晚一起打游戏吗？','링크 보냈어! 확인해 봐.':'我发链接了！看一下。','요즘 추우니까 따뜻하게 입어.':'最近冷，穿暖一点。','사진 보내줄게.':'我给你发照片。','같이 밥 먹을래?':'一起吃饭吗？','방금 영상 진짜 웃겨':'刚才的视频真的好好笑。','전화해 줘.':'给我打电话。','게임할래?':'要一起打游戏吗？','링크 보냈어!':'我发链接了！','따뜻하게 입어.':'穿暖一点。'};
const chineseToKorean={'今天在做什么？我给你发照片。':'오늘 뭐 해? 사진 보내줄게.','到家告诉我！':'집 도착하면 알려줘!','周末一起吃饭吗？':'주말에 같이 밥 먹을래?','哈哈，刚才的视频真的好好笑。':'ㅋㅋㅋ 방금 영상 진짜 웃겨','照片拍得真好！':'사진 너무 잘 나왔다!','好好吃饭。':'밥 잘 챙겨 먹어.','有空给我打电话。':'시간 되면 전화해 줘.','今晚一起打游戏吗？':'오늘 밤 게임할래?','我发链接了！看一下。':'링크 보냈어! 확인해 봐.','最近冷，穿暖一点。':'요즘 추우니까 따뜻하게 입어.','我给你发照片。':'사진 보내줄게.','一起吃饭吗？':'같이 밥 먹을래?','给我打电话。':'전화해 줘.','要一起打游戏吗？':'게임할래?','我发链接了！':'링크 보냈어!','穿暖一点。':'따뜻하게 입어.','你好':'안녕','你在干嘛？':'뭐 하고 있어?','在吗？':'있어?','我想你了':'보고 싶어','晚安':'잘 자','早安':'좋은 아침','谢谢':'고마워','对不起':'미안해','好':'응','嗯嗯':'응응','哈哈':'ㅋㅋㅋ','哈哈哈':'ㅋㅋㅋㅋ','知道了':'알겠어','等一下':'잠깐만','我到了':'도착했어','我马上到':'금방 갈게','吃饭了吗？':'밥 먹었어?','今天辛苦了':'오늘 수고했어','明天见':'내일 봐','没关系':'괜찮아','可以':'좋아','不要':'싫어'};
const familyContactNames=new Set(['爸爸','妈妈','弟弟','小弟','姐姐']);
const kakaoContactNames=new Set(canonicalContacts.filter(([name])=>!familyContactNames.has(name)).map(([name])=>name));
function outgoingLanguage(app,person){if(app==='kakaotalk')return 'ko';if(app==='wechat')return 'zh';if(app==='messages')return kakaoContactNames.has(person)?'ko':'zh';return 'zh';}
function translateToKoreanLocal(text){return chineseToKorean[text]||text;}
function renderChatThread(app,person){
 activeChat=person;
 const isKakao=app==='kakaotalk', isWechat=app==='wechat';
 const all=saved[app]||[];let item=all.find(x=>x.to===person);
 if(!item){item={to:person,body:'',date:'刚刚',thread:[]};all.unshift(item);saved[app]=all;persist()}
 if(!Array.isArray(item.thread))item.thread=item.body?[{from:'them',text:item.body,date:item.date||'刚刚'}]:[];
 // 申惟哥哥聊天演示记录：按参考图初始化，后续版本不重复覆盖。
 if(isKakao&&person==='申惟哥哥'&&item.demoHistoryVersion!==7){
  const demoHistory=[
   {from:'me',text:'형 오늘 몇 시에 집에 가요?',translation:'哥哥你今天几点回家？',date:'16:13'},
   {from:'them',text:'여섯 시 조금 넘어서? 왜?',translation:'六点多吧，怎么了？',date:'16:14'},
   {from:'me',text:'내가 데리러 갈게!',translation:'我去接你吧！',date:'16:14'},
   {from:'them',text:'ㅋㅋㅋ 갑자기 왜?',translation:'ㅋㅋㅋ怎么突然',date:'16:14'},
   {from:'them',text:'형 보고 싶었어?',translation:'想哥哥了？',date:'16:14'},
   {from:'me',text:'응, 형 너무 보고 싶어🥺',translation:'对呀好想哥哥🥺',date:'16:16'},
   {from:'me',text:'하루 못 봤다고 삼 년 같아',translation:'一日不见如隔三秋',date:'16:16'},
   {from:'them',text:'한진……',translation:'韩振……',date:'16:17'},
   {from:'them',text:'헤어진 지 12시간도 안 됐는데',translation:'分开都没有12小时呢',date:'16:17'},
   {from:'them',text:'오늘 수업 없어?',translation:'今天没课了？',date:'16:17'},
   {from:'me',text:'응응',translation:'嗯嗯',date:'16:18'},
   {from:'me',text:'회사 건물 아래에서 보자~ (｡-.-｡)',translation:'你公司楼下见～(｡-.-｡)',date:'16:18'},
   {from:'me',text:'사랑해',translation:'爱你',date:'16:19'},
   {from:'them',text:'응',translation:'好',date:'16:19'},
   {from:'them',text:'나도 사랑해',translation:'我也爱你',date:'16:19'},
   {from:'me',text:'내가 더 사랑해!',translation:'我更爱你！',date:'16:19'},
   {from:'them',text:'……',translation:'……',date:'16:19'},
   {from:'them',type:'voice',text:'语音消息',date:'16:19',src:'assets/kakaotalk/voice/chat-voice-01.mp3'}
  ];
  item.thread=demoHistory;item.demoHistoryV1=true;item.demoHistoryVersion=7;
  const latest=item.thread[item.thread.length-1]||{};item.body=latest.text||'';item.date=latest.date||'16:19';persist();
 }
 if(isKakao&&person==='申惟哥哥'){const voice=item.thread.find(m=>m.type==='voice'&&m.src==='assets/kakaotalk/voice/chat-voice-01.mp3');if(voice&&voice.transcript!=='就这么喜欢哥哥吗？真是疯了。'){voice.transcript='就这么喜欢哥哥吗？真是疯了。';persist();}}
 const bubbles=item.thread.map((m,i)=>{
  const displayText=isWechat&&m.from==='them'?(kakaoChinese[m.text]||m.text):m.text;
  const bubble=m.type==='voice'?
   '<div class="kakao-voice-bubble"><button type="button" class="kakao-voice-play" data-action="voice-play" aria-label="语音加载中" disabled>▶</button><span class="kakao-voice-duration">00:04</span><audio class="kakao-voice-audio" preload="auto" playsinline src="'+esc(m.src||'assets/kakaotalk/voice/chat-voice-01.mp3')+'" aria-label="申惟哥哥的语音消息"></audio></div>' :
   '<div class="chat-bubble">'+(m.recalled?'你撤回了一条消息':esc(displayText))+'</div>';
  const demoTranslation={'형 오늘 몇 시에 집에 가요?':'哥哥你今天几点回家？','여섯 시 조금 넘어서? 왜?':'六点多吧，怎么了？','내가 데리러 갈게!':'我去接你吧！','ㅋㅋㅋ 갑자기 왜?':'ㅋㅋㅋ怎么突然','형 보고 싶었어?':'想哥哥了？','응, 형 너무 보고 싶어🥺':'对呀好想哥哥🥺','하루 못 봤다고 삼 년 같아':'一日不见如隔三秋','한진……':'韩振……','헤어진 지 12시간도 안 됐는데':'分开都没有12小时呢','오늘 수업 없어?':'今天没课了？','응응':'嗯嗯','회사 건물 아래에서 보자~ (｡-.-｡)':'你公司楼下见～(｡-.-｡)','사랑해':'爱你','응':'好','나도 사랑해':'我也爱你','내가 더 사랑해!':'我更爱你！','……':'……'};
  const translationText=m.translation||demoTranslation[m.text]||kakaoChinese[m.text]||'';
  const translation=isKakao&&m.type!=='voice'&&translationText?'<div class="kakao-message-translation">'+esc(translationText)+'</div>':(isKakao&&m.type==='voice'&&m.showTranscript&&m.transcript?'<div class="kakao-message-translation">'+esc(m.transcript)+'</div>':'');
  const prev=item.thread[i-1],showSender=m.from==='them'&&(!prev||prev.from!=='them');
  const next=item.thread[i+1],showTime=!isKakao||!next||next.from!==m.from;
  const sender=isWechat?'':(showSender?'<div class="chat-sender">'+avatarMarkup(person,'chat-sender-avatar')+'<strong>'+esc(person)+'</strong></div>':'');
  const body='<div class="chat-message-body">'+bubble+translation+'</div>';
  const time=showTime?'<small class="chat-time">'+esc(m.date||'')+'</small>':'';
  const wechatAvatar=isWechat&&m.from==='them'?'<span class="wechat-message-avatar">'+avatarMarkup(person,'')+'</span>':'';
  const row=isWechat?(m.from==='me'?'<div class="chat-message-row">'+body+'</div>':'<div class="chat-message-row">'+wechatAvatar+body+'</div>'):(m.from==='me'?'<div class="chat-message-row">'+time+body+'</div>':'<div class="chat-message-row">'+body+time+'</div>');
  return '<div class="chat-line '+(m.from==='me'?'mine':'theirs')+(m.from==='them'?' grouped':'')+'" data-message-index="'+i+'">'+sender+row+'</div>';
 }).join('');
 const navTitle=isKakao?person:isWechat?person:person;
 const tools=isKakao?'<button type="button" data-action="open-chat-settings" aria-label="搜索">⌕</button><button type="button" data-action="social-more" aria-label="更多">☰</button>':isWechat?'<button type="button" data-action="open-chat-settings" aria-label="聊天设置">⌕</button><button type="button" data-action="social-more" aria-label="更多">•••</button>':'<button type="button" data-action="social-more" aria-label="更多">•••</button>';
 appContent.innerHTML=`<div class="sim-app chat-app ${isKakao?'kakao-chat':isWechat?'wechat-chat':''}">
  <div class="chat-nav"><button type="button" data-action="chat-back" aria-label="返回">‹</button><div class="chat-nav-person" ${isWechat?'':'role="button" data-action="open-social-contact" data-person="${esc(person)}"'}>${isWechat?'':avatarMarkup(person,'chat-nav-avatar')}<strong>${esc(navTitle)}</strong></div><span class="chat-nav-tools">${tools}</span></div>
  <div class="chat-history" id="chatHistory">${bubbles||'<div class="chat-day">今天</div>'}</div><div id="chatActionHost"></div>
  <div class="chat-compose"><button type="button" class="chat-attach" aria-label="更多功能">＋</button><input id="chatInput" autocomplete="off" placeholder="${isKakao?'输入消息…':isWechat?'发送消息':'iMessage'}"><button type="button" data-action="send-chat">${isKakao?'发送':isWechat?'发送':'发送'}</button></div>
 </div>`;
 appContent.querySelectorAll('.kakao-voice-audio').forEach(audio=>{
  const bubble=audio.closest('.kakao-voice-bubble'),duration=bubble?.querySelector('.kakao-voice-duration'),play=bubble?.querySelector('.kakao-voice-play');
  const fmt=n=>{if(!Number.isFinite(n))return '0:00';const m=Math.floor(n/60),sec=Math.floor(n%60);return m+':'+String(sec).padStart(2,'0')};
  const fullyBuffered=()=>audio.duration>0&&audio.buffered.length>0&&audio.buffered.end(audio.buffered.length-1)>=audio.duration-.15;
  const enablePlayback=()=>{if((audio.readyState>=4||fullyBuffered())&&play){play.disabled=false;play.setAttribute('aria-label','播放语音')}};
  audio.preload='auto';audio.load();
  audio.addEventListener('loadedmetadata',()=>{if(duration)duration.textContent=fmt(audio.duration);enablePlayback()});
  audio.addEventListener('canplaythrough',enablePlayback);
  audio.addEventListener('progress',enablePlayback);
  audio.addEventListener('error',()=>{if(play){play.disabled=false;play.setAttribute('aria-label','重新加载语音')}});
  if(audio.readyState>=4||fullyBuffered())enablePlayback();
  audio.addEventListener('ended',()=>{if(play)play.textContent='▶';if(duration)duration.textContent=fmt(audio.duration)});
  audio.addEventListener('pause',()=>{if(play)play.textContent='▶'});
  audio.addEventListener('play',()=>{if(play)play.textContent='Ⅱ'});
 });
 updateLockKakaoNotification();
 const history=$('#chatHistory');if(history)history.scrollTop=history.scrollHeight;
}
function renderSocialLanding(app,tab){
 const isKakao=app==='kakaotalk',key=app+'Tab',allPeople=saved.contacts||[],familySet=new Set(familyNames),people=isKakao?allPeople.filter(p=>!familySet.has(p.name)):allPeople.filter(p=>familySet.has(p.name)),chats=saved[app]||[];
 tab=tab||'chats';saved[key]=tab;persist();
 const tabs=isKakao?[['friends','好友'],['chats','聊天'],['open','开放聊天'],['more','更多']]:[['chats','微信','◉'],['contacts','通讯录','♙'],['discover','发现','⌕'],['me','我','☺']];
 const kakaoTabIcon=tab=>({friends:'<svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="8" r="3.5"/><path d="M5 20c.5-3.5 3.2-5.5 7-5.5s6.5 2 7 5.5"/></svg>',chats:'<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 5.5h16v11H11l-5 3v-3H4z"/><path d="M8 10.5h.01M12 10.5h.01M16 10.5h.01"/></svg>',open:'<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M3.5 6.5h13v9h-7l-3.5 2v-2h-2.5z"/><path d="M9 4h11.5v9H18v2l-3-2"/></svg>',more:'<svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="5.5" cy="5.5" r="1.5"/><circle cx="12" cy="5.5" r="1.5"/><circle cx="18.5" cy="5.5" r="1.5"/><circle cx="5.5" cy="12" r="1.5"/><circle cx="12" cy="12" r="1.5"/><circle cx="18.5" cy="12" r="1.5"/><circle cx="5.5" cy="18.5" r="1.5"/><circle cx="12" cy="18.5" r="1.5"/><circle cx="18.5" cy="18.5" r="1.5"/></svg>'})[tab]||'';
 const title=isKakao?({friends:'好友',chats:'聊天',open:'开放聊天',more:'更多'}[tab]||'KakaoTalk'):({chats:'聊天',contacts:'通讯录',discover:'发现',me:'我'}[tab]||'微信');
 let body='';
 if(tab==='chats'){
  const rows=[...chats].sort((a,b)=>Number(!!b.pinned)-Number(!!a.pinned)).map(m=>{const t=Array.isArray(m.thread)?m.thread:[],last=t[t.length-1],preview=last?.from==='them'&&!isKakao?(kakaoChinese[last?.text]||last?.text):last?.text;return '<button class="social-row" data-action="open-chat" data-person="'+esc(m.to)+'">'+avatarMarkup(m.to,isKakao?'contact-avatar kakao-list-avatar':'contact-avatar wechat-list-avatar')+'<span class="social-row-copy"><b>'+esc(m.to)+'</b><small>'+esc(preview||m.body||'点击进入聊天')+'</small></span><time>'+esc(last?.date||m.date||'刚刚')+'</time></button>'}).join('');
  body='<label class="social-chat-search"><span>⌕</span><input id="chatListSearch" type="search" placeholder="'+(isKakao?'搜索聊天':'搜索')+'"></label><div id="messageEditor"></div><div class="social-list">'+(rows||emptyState('💬','还没有聊天','选择联系人开始聊天'))+'</div>';
 }else if(tab==='friends'||tab==='contacts'){
  const rows=people.map(p=>{const remark=isKakao?(p.name==='申惟哥哥'?'哥哥':'朋友'):(p.note||p.phone||'查看联系人资料');return '<button class="social-row" data-action="open-social-contact" data-person="'+esc(p.name)+'">'+avatarMarkup(p.name,isKakao?'contact-avatar kakao-list-avatar':'contact-avatar wechat-list-avatar')+'<span class="social-row-copy"><b>'+esc(p.name)+'</b><small>'+esc(remark)+'</small></span><span>›</span></button>'}).join('');
  body='<label class="social-chat-search"><span>⌕</span><input id="socialContactSearch" type="search" placeholder="搜索联系人"></label><div class="social-list">'+(rows||emptyState('♙','暂无联系人','联系人会显示在这里'))+'</div>';
 }else if(tab==='discover'){
  body='<div class="social-feature-list"><button data-action="social-feature" data-feature="朋友圈"><span>◎</span><b>朋友圈</b><small>分享生活动态</small><i>›</i></button><button data-action="social-feature" data-feature="视频号"><span>▷</span><b>视频号</b><small>看看有趣的视频</small><i>›</i></button><button data-action="social-feature" data-feature="扫一扫"><span>▦</span><b>扫一扫</b><small>扫描二维码</small><i>›</i></button><button data-action="social-feature" data-feature="小程序"><span>▧</span><b>小程序</b><small>发现更多服务</small><i>›</i></button></div>';
 }else if(tab==='me'){
  body='<div class="social-me-card">'+avatarMarkup('我','social-me-avatar')+'<div><b>我的账号</b><small>个人资料与设置</small></div><button data-action="social-more">设置　›</button></div><div class="social-feature-list"><button data-action="social-feature" data-feature="收藏"><span>☆</span><b>收藏</b><i>›</i></button><button data-action="social-feature" data-feature="相册"><span>▧</span><b>相册</b><i>›</i></button><button data-action="social-feature" data-feature="卡包"><span>▤</span><b>卡包</b><i>›</i></button><button data-action="social-more"><span>⚙</span><b>设置</b><i>›</i></button></div>';
 }else if(tab==='open'){
  body='<div class="social-open-hero"><b>发现感兴趣的开放聊天</b><p>加入公开话题，和更多朋友交流</p><button data-action="social-feature" data-feature="推荐聊天室">浏览推荐聊天室</button></div><div class="social-feature-list"><button data-action="social-feature" data-feature="热门聊天室"><span>◉</span><b>热门聊天室</b><i>›</i></button><button data-action="social-feature" data-feature="附近的开放聊天"><span>⌖</span><b>附近的开放聊天</b><i>›</i></button></div>';
 }else{
  body='<div class="social-feature-list"><button data-action="social-more"><span>⚙</span><b>设置</b><i>›</i></button><button data-action="social-feature" data-feature="通知"><span>♧</span><b>通知</b><i>›</i></button><button data-action="social-feature" data-feature="帮助"><span>?</span><b>帮助与支持</b><i>›</i></button></div>';
 }
 const tools=tab==='chats'?'<button type="button" data-action="focus-chat-search" aria-label="搜索">⌕</button><button type="button" data-action="new-message" aria-label="新建聊天">＋</button><button type="button" data-action="social-more" aria-label="更多">•••</button>':'<button type="button" data-action="social-more" aria-label="更多">•••</button>';
 appContent.innerHTML='<div class="sim-app social-shell '+app+'"><header class="social-chat-top"><h2>'+title+'</h2><div class="social-chat-tools">'+tools+'</div></header><main class="social-tab-content">'+body+'</main><nav class="social-tabbar">'+tabs.map(t=>'<button type="button" class="'+(tab===t[0]?'active':'')+'" data-action="social-tab" data-tab="'+t[0]+'"><span>'+(isKakao?kakaoTabIcon(t[0]):t[2])+'</span><small>'+t[1]+'</small></button>').join('')+'</nav></div>';
}
function renderSocialContact(app,person){
 const p=(saved.contacts||[]).find(x=>x.name===person)||{name:person,phone:'',note:''};
 appContent.innerHTML='<div class="sim-app social-subpage '+app+'"><header class="social-subnav"><button data-action="social-detail-back">‹ 返回</button><b>联系人详情</b><button data-action="social-more">•••</button></header><section class="social-contact-card">'+avatarMarkup(p.name,'social-detail-avatar')+'<h2>'+esc(p.name)+'</h2><p>'+esc(app==='kakaotalk'?(p.name==='申惟哥哥'?'哥哥':'朋友'):(p.note||'联系人'))+'</p></section><div class="social-detail-actions"><button data-action="social-contact-message" data-person="'+esc(p.name)+'">发消息</button><button data-action="social-contact-call" data-person="'+esc(p.name)+'">语音通话</button></div><div class="social-feature-list"><div><b>备注</b><small>'+esc(app==='kakaotalk'?(p.name==='申惟哥哥'?'哥哥':'朋友'):(p.note||'未设置'))+'</small></div><div><b>电话号码</b><small>'+esc(p.phone||'未填写')+'</small></div><button data-action="open-social-chat-settings" data-person="'+esc(p.name)+'"><b>聊天设置</b><i>›</i></button></div></div>';
}
function renderSocialChatSettings(app,person){
 const item=(saved[app]||[]).find(x=>x.to===person)||{};
 appContent.innerHTML='<div class="sim-app social-subpage '+app+'"><header class="social-subnav"><button data-action="social-detail-back">‹ 返回</button><b>聊天设置</b><span></span></header><section class="social-contact-card compact">'+avatarMarkup(person,'social-detail-avatar')+'<h2>'+esc(person)+'</h2></section><div class="social-feature-list"><label><span><b>消息免打扰</b><small>关闭此聊天的通知提醒</small></span><input type="checkbox" data-chat-setting="mute" data-person="'+esc(person)+'" '+(item.muted?'checked':'')+'></label><label><span><b>置顶聊天</b><small>在聊天列表中优先显示</small></span><input type="checkbox" data-chat-setting="pinned" data-person="'+esc(person)+'" '+(item.pinned?'checked':'')+'></label><label><span><b>保存到通讯录</b><small>保留联系人资料</small></span><input type="checkbox" data-chat-setting="saved" data-person="'+esc(person)+'" '+(item.savedContact?'checked':'')+'></label><button data-action="clear-chat-history" data-person="'+esc(person)+'"><b>清空聊天记录</b><i>›</i></button></div></div>';
}
function renderSocialMore(app){
 appContent.innerHTML='<div class="sim-app social-subpage '+app+'"><header class="social-subnav"><button data-action="social-detail-back">‹ 返回</button><b>'+(app==='wechat'?'微信':'KakaoTalk')+' · 更多</b><span></span></header><div class="social-feature-list"><button data-action="social-feature" data-feature="通知设置"><b>通知设置</b><i>›</i></button><button data-action="social-feature" data-feature="隐私设置"><b>隐私设置</b><i>›</i></button><button data-action="social-feature" data-feature="聊天背景"><b>聊天背景</b><i>›</i></button><button data-action="social-feature" data-feature="关于应用"><b>关于应用</b><i>›</i></button></div></div>';
}
function renderApp(name){
 const c=appContent;
 const wrap=(inner,sub='')=>`<div class="sim-app ${name}"><div class="sim-app-subtitle">${sub}</div>${inner}</div>`;
 if(name==='notes'){
  const notes=saved.notes||[];
  c.innerHTML=wrap(`<div class="notes-topline"><strong>所有 iCloud</strong><span>${notes.length} 条备忘录</span></div><div class="notes-search"><span>⌕</span><input id="notesSearch" type="search" placeholder="搜索备忘录"></div><div class="notes-section-title">备忘录</div><div id="noteEditor"></div><div class="notes-list">${notes.length?notes.map((n,i)=>`<button class="notes-row" data-action="edit-note" data-index="${i}"><span class="notes-folder-icon">🗒</span><span class="notes-row-copy"><b>${esc(n.title||'新备忘录')}</b><small>${esc((n.body||'没有其他内容').replace(/\\s+/g,' ').slice(0,90))}</small><time>${esc(n.date||'最近')}</time></span><span class="notes-chevron">›</span></button>`).join(''):emptyState('📝','还没有备忘录','点击右下角新建，记录想法')}</div><button class="notes-compose" data-action="new-note" aria-label="新建备忘录">＋</button>`,'');return;
 }
 if(name==='contacts'){
  const contacts=saved.contacts||[];
  c.innerHTML=wrap(`<div class="contacts-heading"><strong>联系人</strong><button class="phone-add" data-action="new-contact" aria-label="添加联系人">＋</button></div><div id="contactEditor"></div><input class="sim-search" id="contactSearch" placeholder="搜索姓名或号码"><div class="sim-list" id="contactList">${contacts.map((p,i)=>contactRow(p,i)).join('')}</div>`,'');return;
 }
 if(name==='photos'){
  const photos=saved.photos||[];c.innerHTML=wrap(`<div class="sim-toolbar"><span>所有照片</span><span class="photo-count">${photos.length} 张照片</span></div><div class="photo-grid">${photos.map((p,i)=>`<button class="photo-tile" data-action="open-photo" data-index="${i}" aria-label="查看照片"><img src="${esc(p.data)}" alt="照片 ${i+1}"></button>`).join('')}</div>${photos.length?'':emptyState('🌄','还没有照片','用相机拍下喜欢的瞬间')}`,'回忆都在这里');return;
 }
 if(name==='voice'){
  const recs=saved.recordings||[];c.innerHTML=wrap(`<div class="voice-recorder"><div class="voice-recorder-top"><span>语音备忘录</span><span class="voice-live-dot"></span></div><div class="voice-wave" aria-hidden="true">${Array.from({length:37},(_,i)=>`<i style="--h:${18+((i*17)%43)}px"></i>`).join('')}</div><div class="voice-clock" id="recordTimer">00:00</div><div class="voice-status" id="recordStatus">准备录音</div><div class="voice-recorder-controls"><button class="voice-record-button" data-action="record-start" aria-label="开始录音"><span></span></button><button class="voice-stop-button" data-action="record-stop" aria-label="停止录音">■</button></div><p class="voice-hint">轻点红色按钮开始录音</p></div><div class="voice-library-head"><h3>所有录音</h3><span>${recs.length} 条</span></div><div class="voice-recording-list">${recs.length?recs.map((r,i)=>`<article class="voice-recording-item"><div class="voice-recording-symbol">波形</div><div class="voice-recording-main"><b>${esc(r.name||'新录音')}</b><small>${esc(r.date||'')}</small><audio controls preload="none" src="${r.data}"></audio></div><button data-action="delete-recording" data-index="${i}" aria-label="删除录音">•••</button></article>`).join(''):emptyState('🎙️','暂无录音','开始录音后会保存在这里')}</div>`,'');return;
 }
 if(name==='camera'){
  const recent=(saved.photos||[])[0];
  c.innerHTML=wrap(`<div class="camera-shell"><div class="camera-topbar"><span aria-hidden="true">⚡</span><span>照片</span><span aria-hidden="true">⌄</span></div><div class="camera-viewfinder" id="cameraPreview"><div class="camera-focus"></div><div class="camera-hint">轻点快门拍摄</div></div><div class="camera-controls"><button class="camera-gallery" type="button" data-action="open-camera-gallery">${recent?'<img src="'+esc(recent.data)+'" alt="最近照片">':'▧'}</button><label class="camera-shutter"><input type="file" id="cameraUpload" accept="image/*" capture="environment" hidden><span></span></label><span class="camera-switch" aria-hidden="true">↻</span></div><div class="camera-modebar"><span>视频</span><b>照片</b><span>人像</span></div><p class="camera-footnote">选择快门可调用设备相机；模拟器也支持从相册选择照片。</p></div>`,'相机');return;
 }
 if(name==='settings'){
  const svgPaths={
   airplane:'<path d="M2 16l20-8-8 14-2-7-10 1z"/><path d="M12 15l-2 7"/>',
   wifi:'<path d="M5 12.5a11 11 0 0 1 14 0"/><path d="M8.5 16a5.5 5.5 0 0 1 7 0"/><path d="M12 20h.01"/>',
   bluetooth:'<path d="M7 7l10 10-5 5V2l5 5L7 17"/>',
   mobile:'<path d="M5 3h14v18H5z"/><path d="M9 6h6M11 18h2"/>',
   battery:'<rect x="3" y="7" width="17" height="10" rx="2"/><path d="M22 10v4M7 10h8"/>',
   bell:'<path d="M18 8a6 6 0 0 0-12 0c0 7-3 7-3 9h18c0-2-3-2-3-9"/><path d="M10 21h4"/>',
   volume:'<path d="M4 10v4h4l5 4V6l-5 4z"/><path d="M17 9a5 5 0 0 1 0 6M19 5a10 10 0 0 1 0 14"/>',
   moon:'<path d="M20 15.5A8.5 8.5 0 0 1 8.5 4 8.5 8.5 0 1 0 20 15.5z"/>',
   hourglass:'<path d="M6 2h12M6 22h12M7 2c0 6 5 6 5 10s-5 4-5 10M17 2c0 6-5 6-5 10s5 4 5 10"/>',
   general:'<circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.7 1.7 0 0 0 .3 1.9l.1.1-1.8 1.8-.1-.1a1.7 1.7 0 0 0-1.9-.3 1.7 1.7 0 0 0-1 1.5v.1h-2.6v-.1a1.7 1.7 0 0 0-1-1.5 1.7 1.7 0 0 0-1.9.3l-.1.1-1.8-1.8.1-.1A1.7 1.7 0 0 0 8 15a1.7 1.7 0 0 0-1.5-1H6.4v-2.6h.1A1.7 1.7 0 0 0 8 10a1.7 1.7 0 0 0-.3-1.9l-.1-.1 1.8-1.8.1.1a1.7 1.7 0 0 0 1.9.3 1.7 1.7 0 0 0 1-1.5V5h2.6v.1a1.7 1.7 0 0 0 1 1.5 1.7 1.7 0 0 0 1.9-.3l.1-.1 1.8 1.8-.1.1a1.7 1.7 0 0 0-.3 1.9 1.7 1.7 0 0 0 1.5 1h.1v2.6h-.1a1.7 1.7 0 0 0-1.5 1z"/>',
   sliders:'<path d="M4 6h16M4 12h16M4 18h16"/><circle cx="9" cy="6" r="2"/><circle cx="15" cy="12" r="2"/><circle cx="8" cy="18" r="2"/>',
   sun:'<circle cx="12" cy="12" r="4"/><path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4m11.4 11.4 1.4 1.4M2 12h2m16 0h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4"/>',
   home:'<path d="M3 10.5L12 3l9 7.5V21H3z"/><path d="M9 21v-7h6v7"/>',
   accessibility:'<circle cx="12" cy="4" r="2"/><path d="M4 8l8 2 8-2M12 10v5m0 0-4 6m4-6 4 6"/>',
   lock:'<rect x="4" y="10" width="16" height="11" rx="2"/><path d="M8 10V7a4 4 0 0 1 8 0v3"/>',
   shield:'<path d="M12 22s8-4 8-11V5l-8-3-8 3v6c0 7 8 11 8 11z"/><path d="M9 12l2 2 4-4"/>',
   store:'<path d="M3 9l2-6h14l2 6"/><path d="M4 9v12h16V9M3 9a3 3 0 0 0 6 0 3 3 0 0 0 6 0 3 3 0 0 0 6 0"/>',
   apps:'<rect x="4" y="4" width="7" height="7" rx="1"/><rect x="13" y="4" width="7" height="7" rx="1"/><rect x="4" y="13" width="7" height="7" rx="1"/><rect x="13" y="13" width="7" height="7" rx="1"/>',
   user:'<circle cx="12" cy="8" r="4"/><path d="M4 21a8 8 0 0 1 16 0"/>'
  };
  const settingsSvg=(name,size=22)=>'<svg aria-hidden="true" viewBox="0 0 24 24" width="'+size+'" height="'+size+'" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round" style="display:block;flex:none">'+(svgPaths[name]||svgPaths.general)+'</svg>';
  const defaults=[['airplane','飞行模式','airplane',false],['wifi','无线局域网','wifi',true],['bluetooth','蓝牙','bluetooth',true],['mobile','移动网络','mobile',true],['battery','电池','battery',true]];
  const toggleRow=([ico,label,key,def])=>`<label class="setting-row"><span class="setting-icon">${settingsSvg(ico)}</span><span class="setting-label">${label}</span><input type="checkbox" data-setting="${key}" ${((saved.settings||{})[key]??def)?'checked':''}></label>`;
  const navRow=(ico,label,detail='')=>`<div class="setting-row settings-nav-row"><span class="setting-icon">${settingsSvg(ico)}</span><span class="setting-label">${label}</span>${detail?`<small>${detail}</small>`:''}<span class="settings-chevron">›</span></div>`;
  c.innerHTML=wrap(`<div class="settings-page"><div class="settings-heading"><h1>设置</h1><label class="settings-search"><span>⌕</span><input type="search" placeholder="搜索"></label></div><button class="settings-profile"><div class="profile-avatar">${settingsSvg('user',30)}</div><div class="settings-account-copy"><b>我的 iPhone</b><p>Apple 账户、iCloud、媒体与购买项目</p></div><span>›</span></button><div class="settings-group settings-connectivity">${defaults.map(toggleRow).join('')}</div><div class="settings-group">${navRow('bell','通知')}${navRow('volume','声音与触感')}${navRow('moon','专注模式')}${navRow('hourglass','屏幕使用时间')}</div><div class="settings-group">${navRow('general','通用')}${navRow('sliders','控制中心')}${navRow('sun','显示与亮度')}${navRow('home','主屏幕与 App 资源库')}${navRow('accessibility','辅助功能')}${actionButton('墙纸　›','change-lock','settings-action')}${navRow('lock','面容 ID 与密码')}${navRow('shield','隐私与安全性')}</div><div class="settings-group">${navRow('store','App Store')}${navRow('apps','App')}</div><div class="settings-group"><div class="settings-section-title">设备管理</div>${actionButton('重置本地模拟数据','reset-data','danger settings-action')}</div><p class="settings-footnote">部分选项为界面示意；可操作开关和壁纸设置会保留原有功能。</p></div>`,'设置');return;
 }
 if(name==='calendar'){
  const today=new Date(),monthKey=saved.calendarMonth||today.toISOString().slice(0,7),[yy,mm]=monthKey.split('-').map(Number),first=new Date(yy,mm-1,1),days=new Date(yy,mm,0).getDate(),offset=first.getDay(),selected=saved.calendarSelected||today.toISOString().slice(0,10),events=saved.events||[],dayEvents=events.map((ev,i)=>({...ev,_i:i})).filter(ev=>(ev.date||'').slice(0,10)===selected).sort((a,b)=>(a.date||'').localeCompare(b.date||'')),week=['日','一','二','三','四','五','六'];
  const cells=Array.from({length:Math.ceil((offset+days)/7)*7},(_,i)=>{const day=i-offset+1;if(day<1||day>days)return '<span class="calendar-empty-day"></span>';const key=`${yy}-${String(mm).padStart(2,'0')}-${String(day).padStart(2,'0')}`,has=events.some(ev=>(ev.date||'').slice(0,10)===key);return `<button class="calendar-day ${key===selected?'selected':''} ${key===today.toISOString().slice(0,10)?'today':''}" data-action="calendar-select-day" data-date="${key}">${day}${has?'<i></i>':''}</button>`}).join('');
  c.innerHTML=wrap(`<div class="calendar-monthbar"><button data-action="calendar-prev" aria-label="上个月">‹</button><strong>${yy}年${mm}月</strong><button data-action="calendar-next" aria-label="下个月">›</button><button class="calendar-today" data-action="calendar-today">今天</button></div><div class="calendar-grid">${week.map(x=>`<span class="calendar-weekday">${x}</span>`).join('')}${cells}</div><div class="calendar-agenda-head"><div><small>${new Date(selected+'T00:00:00').toLocaleDateString('zh-CN',{month:'long',day:'numeric',weekday:'long'})}</small><h3>日程</h3></div><button data-action="add-event">＋</button></div><div id="eventList" class="calendar-events">${dayEvents.length?dayEvents.map(ev=>`<div class="calendar-event"><span class="calendar-event-dot"></span><div><b>${esc(ev.title)}</b><small>${esc((ev.date||'').includes('T')?(ev.date.split('T')[1]||'').slice(0,5):'全天')}</small></div><button data-action="delete-event" data-index="${ev._i}" aria-label="删除日程">×</button></div>`).join(''):emptyState('📅','暂无日程','这一天还没有安排')}</div>`,'');return;
 }
 if(name==='phone'){
  if(!Array.isArray(saved.calls)){saved.calls=(saved.contacts||[]).slice(0,5).map((p,i)=>({name:p.name,number:p.phone,type:i===2?'未接来电':'呼入',time:['今天 21:18','今天 18:42','昨天 19:45','昨天 16:20','周一'][i]}));}
  // Stable IDs prevent stale list positions from targeting a different call after insertion.
  const usedCallIds=new Set();
  (saved.calls||[]).forEach(call=>{if(!call.id||usedCallIds.has(call.id))call.id=createCallId();usedCallIds.add(call.id)});
  persist();
  const tab=saved.phoneTab||'recent', calls=saved.calls||[], contacts=saved.contacts||[];
  const phoneTabIcon=(name)=>{const paths={
  favorites:'<path d="m12 3 2.7 5.5 6.1.9-4.4 4.3 1 6.1-5.4-2.9-5.4 2.9 1-6.1-4.4-4.3 6.1-.9z"/>',
  recent:'<circle cx="12" cy="12" r="9"/><path d="M12 7v5l3.5 2"/>',
  contacts:'<circle cx="9" cy="8" r="3"/><path d="M3.5 20a5.5 5.5 0 0 1 11 0M17 8h4M17 12h4M17 16h4"/>',
  keypad:'<circle cx="6" cy="5" r="1"/><circle cx="12" cy="5" r="1"/><circle cx="18" cy="5" r="1"/><circle cx="6" cy="12" r="1"/><circle cx="12" cy="12" r="1"/><circle cx="18" cy="12" r="1"/><circle cx="6" cy="19" r="1"/><circle cx="12" cy="19" r="1"/><circle cx="18" cy="19" r="1"/>',
  voicemail:'<path d="M7 16a4 4 0 1 1 0-8 4 4 0 0 1 0 8zm10 0a4 4 0 1 1 0-8 4 4 0 0 1 0 8zM7 16h10"/>'
  };return '<svg aria-hidden="true" viewBox="0 0 24 24" width="23" height="23" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round" style="display:block">'+(paths[name]||paths.recent)+'</svg>'};
    const tabs=[['favorites','favorites','个人收藏'],['recent','recent','最近通话'],['contacts','contacts','通讯录'],['keypad','keypad','拨号键盘'],['voicemail','voicemail','语音留言']];
  let body='';
  if(tab==='recent'){
   const filter=saved.phoneFilter||'all', editing=!!saved.phoneEditing;
   const visibleCalls=calls.filter(p=>filter==='missed'?p.type==='未接来电':true);
   body=`<div class="phone-page-heading"><h2>最近通话</h2><button class="phone-edit" data-action="phone-edit-recent">${editing?'完成':'编辑'}</button></div>
   <div class="phone-filter" role="group" aria-label="通话筛选">
    <button type="button" class="${filter==='all'?'selected':''}" data-action="phone-filter" data-filter="all" aria-pressed="${filter==='all'}">全部</button>
    <button type="button" class="${filter==='missed'?'selected':''}" data-action="phone-filter" data-filter="missed" aria-pressed="${filter==='missed'}">未接来电</button>
   </div>
   <div class="phone-list">${visibleCalls.map(p=>`<div class="phone-row ${editing?'is-editing':''}">
    <button type="button" class="phone-row-open" data-action="phone-call-row" data-call-id="${esc(p.id)}" aria-label="回拨 ${esc(p.name||p.number||'未知号码')}">
     ${avatarMarkup(p.name||p.number,'phone-avatar')}
     <span class="phone-row-main"><b>${esc(p.name||p.number||'未知号码')}</b><small class="${p.type==='未接来电'?'missed':''}"><span class="phone-call-type-icon">${p.type==='呼出'?'↗':p.type==='未接来电'?'↙':'↙'}</span>${esc(p.type||'呼入')}${p.number&&p.name&&p.number!==p.name?' · '+esc(p.number):''}</small></span>
     <span class="phone-row-side"><small>${esc(p.time||'最近')}</small><span class="phone-info-icon" aria-hidden="true">ⓘ</span></span>
    </button>
    ${editing?`<button type="button" class="phone-row-delete" data-action="phone-delete-call" data-call-id="${esc(p.id)}" aria-label="删除这条通话记录">删除</button>`:''}
   </div>`).join('')||`<p class="phone-empty">${filter==='missed'?'暂无未接来电':'暂无通话记录'}</p>`}</div>`;
  }
  if(tab==='favorites') body=`<div class="phone-page-heading"><h2>个人收藏</h2><button class="phone-edit" data-action="phone-add-favorite">＋</button></div><div class="phone-favorites-grid">${['申惟哥哥'].map(n=>{const p=contacts.find(x=>x.name===n)||{name:n,phone:''};return `<button class="phone-favorite" data-action="phone-contact-call" data-person="${esc(p.name)}">${avatarMarkup(p.name,'phone-fav-avatar')}<b>${esc(p.name)}</b><small>电话</small></button>`}).join('')}</div>`;
  if(tab==='contacts') body=`<div class="phone-page-heading"><h2>通讯录</h2><button class="phone-add" data-action="new-contact" aria-label="添加联系人">＋</button></div><div id="contactEditor"></div><input class="phone-search" id="contactSearch" placeholder="搜索"><div class="phone-list">${contacts.map(p=>`<button class="phone-contact-row" data-action="phone-contact-call" data-person="${esc(p.name)}">${avatarMarkup(p.name,'phone-avatar')}<span>${esc(p.name)}</span><small>›</small></button>`).join('')}</div>`;
  if(tab==='keypad') body=`<div class="phone-keypad-wrap"><div class="phone-number-field"><input id="dialNumber" type="tel" inputmode="tel" autocomplete="tel" placeholder="输入电话号码" aria-label="电话号码" value="${esc(saved.phoneDialNumber||'')}"><button type="button" data-action="phone-backspace" aria-label="删除号码"><svg class="phone-dial-svg phone-delete-svg" viewBox="0 0 24 24" aria-hidden="true"><path d="M9 5H20V19H9L3 12L9 5Z"/><path d="M12 9L17 15M17 9L12 15"/></svg></button></div><div class="phone-keypad">${[['1',''],['2','ABC'],['3','DEF'],['4','GHI'],['5','JKL'],['6','MNO'],['7','PQRS'],['8','TUV'],['9','WXYZ'],['*',''],['0','+'],['#','']].map(([n,l])=>`<button data-action="phone-key" data-key="${n}"><b>${n}</b><small>${l}</small></button>`).join('')}</div><button class="phone-call-button" data-action="dial-call" aria-label="呼叫"><svg class="phone-dial-svg phone-call-svg" viewBox="0 0 24 24" aria-hidden="true"><path d="M6.6 3.5L9.2 3C10 2.8 10.8 3.2 11.1 4L12.2 6.7C12.5 7.4 12.3 8.2 11.7 8.7L10.1 10C11.1 12 12.7 13.6 14.7 14.6L16 13C16.5 12.4 17.3 12.2 18 12.5L20.7 13.6C21.5 13.9 21.9 14.7 21.7 15.5L21.2 18.1C21 19.2 20 20 18.9 20C10.7 20 4 13.3 4 5.1C4 4 4.8 4 6.6 3.5Z"/></svg></button></div>`;
  if(tab==='voicemail') body=`<section class="phone-voicemail-page"><div class="phone-page-heading"><h2>语音留言</h2><button class="phone-edit" type="button">编辑</button></div><div class="phone-voicemail-empty"><div class="phone-voicemail-art"><svg viewBox="0 0 72 72" aria-hidden="true"><circle cx="36" cy="36" r="29"/><path d="M25 39V33a11 11 0 0 1 22 0v6"/><rect x="21" y="36" width="9" height="15" rx="4.5"/><rect x="42" y="36" width="9" height="15" rx="4.5"/><path d="M51 48c0 6-5 9-12 9h-3"/></svg></div><b>没有语音留言</b><p>收到的语音留言会显示在这里。</p></div></section>`;
  c.innerHTML=`<div class="sim-app phone-app"><main class="phone-tab-content">${body}</main><nav class="phone-tabbar">${tabs.map(([k,ico,label])=>`<button type="button" class="${tab===k?'active':''}" data-action="phone-tab" data-tab="${k}" aria-label="${label}"><span>${phoneTabIcon(ico)}</span><small>${label}</small></button>`).join('')}</nav></div>`;return;
 }
 if(name==='mail'){
  const items=saved.mail||[];
  const rows=items.map((m,i)=>{const subject=m.subject||((m.body||'').match(/^主题：([^\n]+)/)?.[1])||'（无主题）',preview=(m.body||'').replace(/^主题：[^\n]+\n?/,'');return `<button class="mail-row" data-action="open-mail" data-index="${i}"><span class="mail-avatar">${esc((m.to||'收件人').slice(0,1))}</span><span class="mail-copy"><b>${esc(m.to||'未知发件人')}</b><strong>${esc(subject)}</strong><small>${esc(preview.slice(0,72))}</small></span><time>${esc(m.date||'')}</time></button>`}).join('');
  c.innerHTML=wrap(`<div class="mail-toolbar"><div><strong>收件箱</strong><small>${items.length} 封邮件</small></div><button data-action="new-message" aria-label="写邮件">✎</button></div><div id="messageEditor"></div><div class="mail-list">${rows||emptyState('✉️','收件箱为空','点击右上角写一封邮件')}</div><div class="mail-bottom"><span>📥 收件箱</span><span>⭐ VIP</span><span>📤 已发送</span><span>🗂 邮箱</span></div>`,'邮件');return;
 }
 if(name==='messages'||name==='kakaotalk'||name==='wechat'){
  if(name==='wechat'||name==='kakaotalk'){renderSocialLanding(name,saved[name+'Tab']||'chats');return}
  const isMail=name==='mail',label=isMail?'收件箱':'信息',items=saved[name]||[];
  const rows=items.map(m=>{const thread=Array.isArray(m.thread)?m.thread:[],latest=thread[thread.length-1];return '<button class="sim-list-row message-row" data-action="open-chat" data-person="'+esc(m.to||'新对话')+'">'+avatarMarkup(m.to||'聊')+'<span class="message-row-copy"><b>'+esc(m.to||'新对话')+'</b><small>'+esc(latest?.text||m.body||'点击进入聊天')+'</small></span><span class="message-row-meta"><small class="message-time">'+esc(latest?.date||m.date||'刚刚')+'</small></span></button>'}).join('');
  c.innerHTML=wrap('<div class="message-heading"><b>'+label+'</b>'+actionButton(isMail?'＋ 写邮件':'＋ 新信息','new-message')+'</div><div id="messageEditor"></div><div class="sim-list message-list">'+(rows||emptyState('💬','还没有对话','点击右上角按钮，创建一条模拟聊天'))+'</div>','');return;
 }
 if(name==='instagram'){
  const socialIcon=(name)=>({
   home:'<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M3 10.8 12 3l9 7.8v9.1a1.1 1.1 0 0 1-1.1 1.1h-5.2v-6.5H9.3V21H4.1A1.1 1.1 0 0 1 3 19.9z" fill="currentColor"/></svg>',
   reels:'<svg viewBox="0 0 24 24" aria-hidden="true"><rect x="3" y="3" width="18" height="18" rx="5" fill="none" stroke="currentColor" stroke-width="2.1"/><path d="m10 8 6 4-6 4z" fill="none" stroke="currentColor" stroke-width="2" stroke-linejoin="round"/></svg>',
   plane:'<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M21.5 2.8 2.8 10.1c-1 .4-.9 1.8.1 2.1l7.1 2.2 2.2 7.1c.3 1 1.7 1.1 2.1.1l7.3-18.7c.4-1-.1-1.5-1.1-1.1ZM10 14l7.3-7.3" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>',
   search:'<svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="10.8" cy="10.8" r="7.2" fill="none" stroke="currentColor" stroke-width="2.1"/><path d="m16.2 16.2 5 5" fill="none" stroke="currentColor" stroke-width="2.1" stroke-linecap="round"/></svg>',
   heart:'<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M20.8 8.8c0 5.1-8.8 11.1-8.8 11.1S3.2 13.9 3.2 8.8A4.7 4.7 0 0 1 12 6.1a4.7 4.7 0 0 1 8.8 2.7Z" fill="none" stroke="currentColor" stroke-width="2" stroke-linejoin="round"/></svg>',
   comment:'<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M20.5 11.5a8.5 8.5 0 0 1-9 8.2 9.8 9.8 0 0 1-4-.8L3 20l1.2-3.8a7.7 7.7 0 0 1-1.2-4.7 8.5 8.5 0 0 1 9-8.2 8.5 8.5 0 0 1 8.5 8.2Z" fill="none" stroke="currentColor" stroke-width="2" stroke-linejoin="round"/></svg>',
   bookmark:'<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M6 3.5h12v17l-6-4-6 4z" fill="none" stroke="currentColor" stroke-width="2" stroke-linejoin="round"/></svg>'
  })[name]||'';
  const igFriends=[['shinyu','申惟哥哥'],['dohoon','道勋哥'],['youngjae','英宰哥'],['jihoon','志薰🪼'],['kyungmin','炅潣']];
  const posts=igFriends.map(([u,n],i)=>({username:u,name:n,avatar:avatarMarkup(n,'ig-avatar'),caption:['最近的生活碎片，慢慢记录。','오늘도 좋은 하루!','周末出去走走，天气刚刚好。','ㅋㅋㅋ 今天也很有趣。','오늘 사진 마음에 들어.'][i],likes:[128,96,74,53,61][i],em:['🌙','☕','🌤️','🎧','📷'][i],title:['日常记录','오늘의 하루','周末散步','今天的碎片','사진 기록'][i]}));
  const section=saved.igSection||'home';
  const stories=igFriends.map(([u,n])=>`<button class="ig-story" data-action="ig-open-story" data-user="${u}"><span class="ig-story-avatar">${avatarMarkup(n,'ig-friend-avatar')}</span><small>${u}</small></button>`).join('');
  const feedPosts=posts.map((p,i)=>`<article class="ig-post"><div class="ig-post-head">${p.avatar}<div><b>${p.username}</b></div><button class="ig-more" aria-label="更多">•••</button></div><div class="ig-post-art ig-art-${i%3}"><span>${p.em}</span><b>${p.title}</b><small>${p.caption}</small></div><div class="ig-post-actions"><button class="social-like ${saved.socialLikes?.instagram?.[p.username]?"is-liked":""}" data-action="social-like" data-network="instagram" data-user="${p.username}" aria-label="赞">${saved.socialLikes?.instagram?.[p.username]?"♥":socialIcon("heart")}</button><button aria-label="评论">${socialIcon("comment")}</button><button aria-label="分享">${socialIcon("plane")}</button><button class="ig-bookmark" aria-label="收藏">${socialIcon("bookmark")}</button></div><b class="ig-likes">${p.likes+(saved.socialLikes?.instagram?.[p.username]?1:0)} 次赞</b><p class="ig-caption"><b>${p.username}</b> ${p.caption}</p></article>`).join('');
  const profile=section==='profile';
  const profileBody=`<div class="ig-profile"><div class="ig-profile-heading"><b>hanjin</b><div><button aria-label="新增">＋</button><button aria-label="菜单">☰</button></div></div><div class="ig-profile-summary"><div class="ig-profile-photo">${avatarMarkup('hanjin','ig-own-avatar')}</div><div class="ig-profile-numbers"><b>0<small>帖子</small></b><b>12864<small>粉丝</small></b><b>12<small>关注</small></b></div></div><div class="ig-profile-name">hanjin</div><div class="ig-profile-handle">@hanjin</div><div class="ig-profile-actions"><button>编辑主页</button><button>分享主页</button><button aria-label="添加好友">＋</button></div><div class="ig-profile-tabs"><button class="${(saved.igProfileTab||'grid')==='grid'?'active':''}" data-action="ig-profile-tab" data-tab="grid" aria-label="帖子网格"><svg viewBox="0 0 24 24"><rect x="3" y="3" width="5" height="5" rx=".7"/><rect x="9.5" y="3" width="5" height="5" rx=".7"/><rect x="16" y="3" width="5" height="5" rx=".7"/><rect x="3" y="9.5" width="5" height="5" rx=".7"/><rect x="9.5" y="9.5" width="5" height="5" rx=".7"/><rect x="16" y="9.5" width="5" height="5" rx=".7"/><rect x="3" y="16" width="5" height="5" rx=".7"/><rect x="9.5" y="16" width="5" height="5" rx=".7"/><rect x="16" y="16" width="5" height="5" rx=".7"/></svg></button><button class="${saved.igProfileTab==='reels'?'active':''}" data-action="ig-profile-tab" data-tab="reels" aria-label="Reels"><svg viewBox="0 0 24 24"><rect x="3" y="3" width="18" height="18" rx="4"/><path d="m10 8 6 4-6 4z"/></svg></button><button class="${saved.igProfileTab==='reposts'?'active':''}" data-action="ig-profile-tab" data-tab="reposts" aria-label="转发"><svg viewBox="0 0 24 24"><path d="M7 7h11l-3-3m3 3-3 3M17 17H6l3 3m-3-3 3-3" /></svg></button><button class="${saved.igProfileTab==='tagged'?'active':''}" data-action="ig-profile-tab" data-tab="tagged" aria-label="标记的照片"><svg viewBox="0 0 24 24"><rect x="3" y="3" width="18" height="18" rx="3"/><circle cx="12" cy="9" r="3"/><path d="M6.5 19c.7-3.1 2.5-4.7 5.5-4.7s4.8 1.6 5.5 4.7"/></svg></button></div><div class="ig-profile-empty">还没有发布帖子</div></div>`;
  c.innerHTML=wrap(`<div class="ig-app"><div class="ig-topbar"><button aria-label="创建">＋</button><strong>Instagram</strong><button aria-label="通知">♡</button></div>${profile?profileBody:`<div class="ig-stories"><button class="ig-story ig-own-story" data-action="ig-section" data-section="profile"><span class="ig-story-avatar own">${avatarMarkup('hanjin','ig-own-avatar')}<i>＋</i></span><small>你的快拍</small></button>${stories}</div><div id="postEditor"></div><div class="ig-feed">${feedPosts}</div>`}<div class="ig-bottom"><button class="${!profile?'active':''}" data-action="ig-section" data-section="home" aria-label="首页">${socialIcon("home")}</button><button aria-label="Reels">${socialIcon("reels")}</button><button aria-label="私信">${socialIcon("plane")}</button><button aria-label="搜索">${socialIcon("search")}</button><button class="${profile?'active':''}" data-action="ig-section" data-section="profile" aria-label="个人主页">${avatarMarkup('hanjin','ig-nav-avatar')}</button></div></div>`,'');return;
 }
 if(name==='x'){
  const socialIcon=(name)=>({
   home:'<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M2.8 10.8 12 3l9.2 7.8v9.1a1.1 1.1 0 0 1-1.1 1.1h-5.2v-6.6H9.1V21H3.9a1.1 1.1 0 0 1-1.1-1.1z" fill="currentColor"/></svg>',
   search:'<svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="10.8" cy="10.8" r="7.2" fill="none" stroke="currentColor" stroke-width="2.1"/><path d="m16.2 16.2 5 5" fill="none" stroke="currentColor" stroke-width="2.1" stroke-linecap="round"/></svg>',
   bell:'<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M18 9a6 6 0 0 0-12 0c0 7-3 7-3 9h18c0-2-3-2-3-9M10 21h4" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>',
   mail:'<svg viewBox="0 0 24 24" aria-hidden="true"><rect x="3" y="5" width="18" height="14" rx="2" fill="none" stroke="currentColor" stroke-width="2"/><path d="m4 7 8 6 8-6" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>',
   reply:'<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M20.5 11.5a8.5 8.5 0 0 1-9 8.2 9.8 9.8 0 0 1-4-.8L3 20l1.2-3.8a7.7 7.7 0 0 1-1.2-4.7 8.5 8.5 0 0 1 9-8.2 8.5 8.5 0 0 1 8.5 8.2Z" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linejoin="round"/></svg>',
   repost:'<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M7 7h11l-3-3m3 3-3 3M17 17H6l3 3m-3-3 3-3" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>',
   heart:'<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M20.8 8.8c0 5.1-8.8 11.1-8.8 11.1S3.2 13.9 3.2 8.8A4.7 4.7 0 0 1 12 6.1a4.7 4.7 0 0 1 8.8 2.7Z" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linejoin="round"/></svg>',
   stats:'<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 20V12M10 20V5M16 20V9M22 20V3" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"/></svg>',
   bookmark:'<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M6 3.5h12v17l-6-4-6 4z" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linejoin="round"/></svg>',
   share:'<svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="18" cy="5" r="2.5" fill="none" stroke="currentColor" stroke-width="1.8"/><circle cx="6" cy="12" r="2.5" fill="none" stroke="currentColor" stroke-width="1.8"/><circle cx="18" cy="19" r="2.5" fill="none" stroke="currentColor" stroke-width="1.8"/><path d="m8.2 10.8 7.5-4.5m-7.5 6.9 7.5 4.5" fill="none" stroke="currentColor" stroke-width="1.8"/></svg>'
  })[name]||'';
  const tab=saved.xTab||'for-you';const section=saved.xSection||'home';
  const tabs=[['for-you','为你推荐'],['following','正在关注']];
  const xFriends=[['shinyu','申惟哥哥','🖤','오늘도 수고했어. 저녁은 꼭 챙겨 먹어.','今天也辛苦了，记得好好吃晚饭。',18],['dohoon','道勋哥','🤍','퇴근길에 좋은 노래 발견!','下班路上发现了一首好歌！',12],['youngjae','英宰哥','🌿','주말에는 조금 느긋하게.','周末就慢慢来吧。',9],['jihoon','志薰🪼','🪼','ㅋㅋㅋ 이거 진짜 웃기다','ㅋㅋㅋ这个真的很好笑',7],['kyungmin','炅潣','🐻','오늘 사진 한 장 📷','今天的一张照片 📷',11]];
  const visibleFriends=tab==='following'?xFriends:xFriends;
  const feed=visibleFriends.map(([u,n,avatar,body,translation,likes],i)=>`<article class="x-post">${avatarMarkup(n,"x-avatar")}<div class="x-post-main"><div class="x-post-meta"><b>${u}</b><span>@${u} · ${i+1}小时</span><button aria-label="更多">•••</button></div><p>${body}<small class="x-translation">${translation}</small></p><div class="x-post-stats"><button data-action="x-reply" data-index="${i}" aria-label="回复">${socialIcon("reply")} <span>${(saved.xReplies?.[u]||[]).length+[2,1,3,0,2][i]}</span></button><button data-action="x-repost" data-index="${i}">${socialIcon("repost")} <span>${[4,2,3,1,2][i]}</span></button><button class="social-like ${saved.socialLikes?.x?.[u] ? "is-liked" : ""}" data-action="social-like" data-network="x" data-user="${u}" aria-label="赞">${socialIcon("heart")} <span>${likes+(saved.socialLikes?.x?.[u] ? 1 : 0)}</span></button><button aria-label="浏览量">${socialIcon("stats")} <span>${[128,96,74,53,61][i]}</span></button><button aria-label="收藏">${socialIcon("bookmark")}</button><button aria-label="分享">${socialIcon("share")}</button></div>${saved.xReplyOpen===u?`<div class="x-reply-panel"><div class="x-reply-list">${(saved.xReplies?.[u]||[]).map(r=>`<p><b>hanjin</b> ${esc(r)}</p>`).join('')}</div><textarea id="xReplyInput" rows="2" placeholder="发布你的回复"></textarea><button data-action="x-publish-reply" data-user="${u}">回复</button></div>`:''}</div></article>`).join('');
  let sectionBody='';
  if(saved.xComposerOpen){sectionBody=`<div class="x-compose-page"><div class="x-compose-head"><button data-action="x-cancel-post" aria-label="关闭">×</button><button class="x-compose-publish" data-action="x-publish-post">发帖</button></div><div class="x-compose-editor"><div class="x-compose-avatar">${avatarMarkup("hanjin","x-avatar")}</div><textarea id="xPostBody" rows="4" placeholder="有什么新鲜事？"></textarea></div><div class="x-compose-bottom"><button class="x-reply-permission" type="button">🌐　所有人可以回复</button><div class="x-compose-tools"><label class="x-compose-tool" aria-label="添加图片"><svg viewBox="0 0 24 24"><rect x="3" y="3" width="18" height="18" rx="3"/><circle cx="8.5" cy="8.5" r="1.5"/><path d="m21 15-5-5L5 21"/></svg><input type="file" id="xPostImage" accept="image/*" hidden></label><button type="button" aria-label="相机"><svg viewBox="0 0 24 24"><path d="M4 7h3l2-3h6l2 3h3a2 2 0 0 1 2 2v10a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V9a2 2 0 0 1 2-2Z"/><circle cx="12" cy="13" r="4"/></svg></button><button type="button" aria-label="效果"><svg viewBox="0 0 24 24"><path d="m12 2 1.8 6.2L20 10l-6.2 1.8L12 18l-1.8-6.2L4 10l6.2-1.8L12 2Z"/><path d="m19 15 .9 2.1L22 18l-2.1.9L19 21l-.9-2.1L16 18l2.1-.9L19 15Z"/></svg></button><button type="button" aria-label="直播"><svg viewBox="0 0 24 24"><rect x="3" y="5" width="18" height="14" rx="3"/><path d="m10 9 5 3-5 3z"/></svg><small>LIVE</small></button><button type="button" aria-label="GIF" class="x-gif-tool">GIF</button><button type="button" aria-label="投票"><svg viewBox="0 0 24 24"><path d="M4 5h2v2H4zM9 6h11M4 11h2v2H4zM9 12h11M4 17h2v2H4zM9 18h11"/></svg></button><button type="button" aria-label="位置"><svg viewBox="0 0 24 24"><path d="M20 10c0 5-8 12-8 12S4 15 4 10a8 8 0 1 1 16 0Z"/><circle cx="12" cy="10" r="2.5"/></svg></button><button type="button" aria-label="添加"><svg viewBox="0 0 24 24"><path d="M12 5v14M5 12h14"/></svg></button></div></div></div>`;}else if(section==='home') sectionBody=`<div class="x-tabs">${tabs.map(([k,t])=>`<button class="${tab===k?'active':''}" data-action="x-tab" data-tab="${k}">${t}</button>`).join('')}</div><div class="x-feed">${feed||emptyState('𝕏','暂时没有帖子','点击右下角＋发布第一条动态')}</div><button class="x-fab-compose" data-action="x-new-post" aria-label="发帖">＋</button>`;
  else if(section==='search') sectionBody=`<div class="x-section-page"><h2>搜索</h2><input class="x-search-input" placeholder="搜索 X"><h3>发生了什么</h3><p>探索热门话题、账号和最新动态</p><div class="x-trend"><small>日本 · 趋势</small><b># 今日の話題</b><small>正在讨论 · 更多帖子</small></div><div class="x-trend"><small>娱乐 · 趋势</small><b>韩国流行音乐</b><small>热门讨论</small></div></div>`;
  else if(section==='communities') sectionBody=`<div class="x-section-page"><h2>社群</h2><p>加入感兴趣的社群，和大家交流。</p><div class="x-trend"><b>摄影与日常</b><small>分享照片、灵感和生活碎片</small></div><div class="x-trend"><b>K-POP 讨论区</b><small>聊聊喜欢的音乐和舞台</small></div></div>`;
  else if(section==='notifications') sectionBody=`<div class="x-section-page"><h2>通知</h2><div class="x-notice"><b>欢迎来到 X</b><p>点赞、回复和关注动态会显示在这里。</p></div></div>`;
  else if(section==='messages') sectionBody=`<div class="x-section-page x-messages-page"><h2>私信</h2><div class="x-empty-messages"><span>✉️</span><b>暂无消息</b><small>当有人向你发送私信时，会显示在这里。</small></div></div>`;
  else if(section==='profile'){
   const ownPosts=(saved.posts_x||[]).map((p,i)=>`<article class="x-post">${avatarMarkup("hanjin","x-avatar")}<div class="x-post-main"><div class="x-post-meta"><b>hanjin</b><span>@hanjin · 刚刚</span></div><p>${esc(p.body||p.title||'')}</p></div></article>`).join('');
   sectionBody=`<div class="x-section-page x-profile-page"><div class="x-cover"></div>${avatarMarkup("hanjin","x-profile-avatar")}<h2>hanjin</h2><p>@hanjin</p><div class="x-profile-stats"><b>12 <small>正在关注</small></b><b>12864 <small>关注者</small></b></div><div class="x-following-list"><b>正在关注</b><div>${xFriends.map(([u,n])=>`<span>${avatarMarkup(n,"x-follow-avatar")}<small>${u}</small></span>`).join('')}</div></div><button class="x-edit-profile">编辑个人资料</button><div class="x-profile-tabs"><button class="active">帖子</button><button>回复</button><button>媒体</button></div>${ownPosts||'<div class="x-own-empty">还没有发布帖子</div>'}</div>`;
  } else sectionBody=`<div class="x-section-page"><h2>个人资料</h2></div>`;
  const nav=[['home','home','首页'],['search','search','搜索'],['notifications','bell','通知'],['messages','mail','私信']];
  const menu=saved.xMenuOpen?`<div class="x-menu-backdrop" data-action="x-menu-close"></div><aside class="x-side-menu"><div class="x-menu-head">${avatarMarkup("hanjin","x-menu-avatar")}<button data-action="x-menu-close">×</button></div><b class="x-menu-name">hanjin</b><small class="x-menu-handle">@hanjin</small><div class="x-menu-counts"><span><b>12</b> 正在关注</span><span><b>12864</b> 关注者</span></div><button class="x-menu-profile" data-action="x-menu-profile">个人资料</button><button class="x-menu-item">Premium</button><button class="x-menu-item">书签</button><button class="x-menu-item">列表</button><button class="x-menu-item">设置和隐私</button></aside>`:'';
  c.innerHTML=wrap(`<div class="x-shell ${saved.xComposerOpen?'x-composing':''}">${saved.xComposerOpen?'':`<div class="x-topbar"><button class="x-self-avatar" data-action="x-menu-toggle" aria-label="打开账户菜单">${avatarMarkup("hanjin","x-own-avatar")}</button><strong>𝕏</strong><button class="x-premium">升级</button></div>`}<div class="x-content">${sectionBody}</div>${saved.xComposerOpen?'':`<div class="x-bottom">${nav.map(([k,ico,t])=>`<button class="${section===k?'active':''}" aria-label="${t}" data-action="x-section" data-section="${k}">${socialIcon(ico)}</button>`).join('')}</div>`}${menu}</div>`,'');return;
 }
 if(name==='xiaohongshu'){
  const tab=saved.xhsTab||'home';
  const following=saved.xhsFollowing||(saved.xhsFollowing=Math.floor(Math.random()*240+30));
  const profileTab=saved.xhsProfileTab||'notes';
  const category=saved.xhsCategory||'推荐';
  const query=saved.xhsQuery||'';
  // 首次打开搜索页时预置参考截图中的三条历史记录；用户主动清空后保持空白。
 if(!Array.isArray(saved.xhsSearchHistory)){
  saved.xhsSearchHistory=[];
}

if(
  saved.xhsSearchHistory.length===0 &&
  saved.xhsSearchHistoryCleared!==true
){
  saved.xhsSearchHistory=[
    '韩国打卡地点推荐',
    '礼山',
    '太喜欢哥哥了怎么办'
  ];
  persist();
}
  const history=saved.xhsSearchHistory;
  const feed=[
   ['美妆','男生也能用的清爽底妆思路','少量妆前保湿，局部遮瑕后薄薄压一层散粉。重点是均匀肤色，不要让底妆有厚重面具感。','xhs-assets/beauty_01.jpg','2.4万','momo的化妆台','💗'],
   ['自拍','男生镜子自拍｜手机放这个高度更显比例','手机放在胸口到下巴之间试拍，身体微侧、肩膀放松，背景尽量留白。','xhs-assets/selfie_01.jpg','8763','日常自拍研究所','🪞'],
   ['出片','韩系男生拍照｜咖啡店窗边怎么站','先找侧面自然光，身体不要正对镜头，视线看窗外或手里的咖啡，画面更松弛。','xhs-assets/photo_01.jpg','1.1万','出片灵感簿','📸'],
   ['韩语学习','每天五分钟｜初级韩语日常短句','안녕하세요 你好；오늘 뭐 해요? 今天做什么？先跟读，再把短句放进真实生活场景里练习。','xhs-assets/korean_01.jpg','5632','momo学韩语','🇰🇷'],
   ['美妆','男生眉毛整理｜自然不生硬的关键','先顺着眉毛生长方向梳理，只修掉明显杂毛，眉头不要画得太实，保留原生毛流。','xhs-assets/beauty_02.jpg','3.6万','清爽男生护理','🌿'],
   ['自拍','不露脸也能拍｜男生穿搭镜子照','手机稍微挡住面部，脚尖错开站，衣服保持简单配色，画面里留一点环境空间。','xhs-assets/selfie_02.jpg','9450','镜头里的日常','🤍'],
   ['出片','首尔街拍构图｜全身照别贴着墙站','人物离背景一段距离，镜头略低于腰部，利用街道线条引导视线，腿部比例更自然。','xhs-assets/photo_02.jpg','1.8万','周末拍照计划','☕'],
   ['韩语学习','韩语发音入门｜先分清收音','先练 가、나、다 等基础音节，再慢速练习 받침 收音。每天短时间重复，比一次背很多更有效。','xhs-assets/korean_02.jpg','7218','韩语慢慢学','📖'],
   ['美妆','男生护肤顺序｜早上三步就够','洁面后先保湿，再涂防晒。容易出油的区域少量叠加，先把皮肤状态稳定下来。','xhs-assets/beauty_03.jpg','1.6万','日常护理笔记','🧴'],
   ['出片','男生夜景人像｜找一块干净的光','站在店铺暖光边缘，曝光稍微压低一点，避免背景灯牌过曝，人物轮廓会更清晰。','xhs-assets/photo_03.jpg','9860','夜景出片指南','🌙'],
   ['韩语学习','韩语学习桌面｜一页笔记怎么整理','把单词、例句和易错点分成三栏，每天复习旧词再增加少量新词，笔记更容易回看。','xhs-assets/korean_03.jpg','6048','自习室记录','✏️'],
   ['美妆','男生唇部护理｜自然润色不油亮','睡前厚涂润唇膏，白天用纸巾轻压掉多余油光，选择透明或低饱和润色款更自然。','xhs-assets/beauty_04.jpg','1.2万','清爽护理研究所','🫧']
  ];
  const categories=['推荐','美妆','自拍','出片','韩语学习'];
  const nav=(active)=>'<div class="xhs-bottom"><button class="'+(active==='home'?'active':'')+'" data-action="xhs-tab" data-tab="home">首页</button><button class="'+(active==='mall'?'active':'')+'" data-action="xhs-tab" data-tab="mall">市集</button><button class="xhs-plus" aria-label="发布">＋</button><button class="'+(active==='messages'?'active':'')+'" data-action="xhs-tab" data-tab="messages">消息</button><button class="'+(active==='me'?'active':'')+'" data-action="xhs-tab" data-tab="me">我</button></div>';
  const card=(p)=>'<article class="xhs-card"><img src="'+p[3]+'" alt="'+p[1]+'" loading="lazy"><div class="xhs-card-text"><small class="xhs-tag">'+p[0]+'</small><b>'+p[1]+'</b><p>'+p[2]+'</p><div class="xhs-card-author"><span class="xhs-mini-avatar">'+p[6]+'</span><span>'+p[5]+'</span><span class="xhs-heart">♡ '+p[4]+'</span></div></div></article>';
  const suggestions=(q='')=>{
    const words=['男生清透底妆','韩系男生自拍姿势','男生眉毛怎么修','首尔街拍构图','韩语日常口语','男生护肤步骤','咖啡店拍照技巧','韩语发音入门'];
    if(!q)return words;
    const matched=feed.filter(p=>(p[0]+p[1]+p[2]).toLowerCase().includes(q.toLowerCase())).map(p=>p[1]);
    const related=words.filter(w=>w.toLowerCase().includes(q.toLowerCase())||q.toLowerCase().split('').some(ch=>ch.length>0&&w.toLowerCase().includes(ch)));
    return [...new Set([...matched,...related,...words])].slice(0,8);
  };
  const searchPage=(results=false)=>{
    const escapedQuery=esc(query);
    const hits=feed.filter(p=>(p[0]+' '+p[1]+' '+p[2]).toLowerCase().includes(query.toLowerCase()));
    return '<div class="xhs-scroll xhs-search-page"><div class="xhs-search-head"><button class="xhs-back" data-action="xhs-search-back">‹</button><form class="xhs-search-form" id="xhsSearchForm"><span>⌕</span><input id="xhsSearchInput" value="'+escapedQuery+'" placeholder="搜索你感兴趣的内容" autocomplete="off"><button type="button" class="xhs-camera" aria-label="图片搜索">▣</button><button type="submit" class="xhs-submit">搜索</button></form></div>'+
      (results?'<div class="xhs-search-results-title">搜索结果</div><div class="xhs-masonry">'+(hits.length?hits.map(card).join(''):'<div class="xhs-search-empty">没有找到相关笔记，试试其他关键词吧</div>')+'</div>':
      '<section class="xhs-search-section"><div class="xhs-search-section-title">历史记录 <button type="button" data-action="xhs-clear-history" aria-label="清空历史">▤</button></div><div class="xhs-history-list">'+(history.length?history.map(h=>'<button type="button" data-action="xhs-history-item" data-query="'+esc(h)+'">'+esc(h)+'</button>').join(''):'<span class="xhs-muted">暂无搜索记录</span>')+'</div></section><section class="xhs-search-section"><div class="xhs-search-section-title">猜你想搜 <span>···</span></div><div class="xhs-suggest-grid">'+suggestions().map(w=>'<button type="button" data-action="xhs-suggestion" data-query="'+esc(w)+'">'+esc(w)+'</button>').join('')+'</div></section>')+'</div>'+nav('home');
  };
  if(tab==='search'||tab==='search-results'){c.innerHTML=wrap(searchPage(tab==='search-results'),'');return}
  if(tab==='messages'){c.innerHTML=wrap('<div class="xhs-scroll"><div class="xhs-topbar"><strong>消息</strong></div></div>'+nav('messages'),'');return}
  if(tab==='me'){
    const empty=profileTab==='notes'?['📔','还没有发布笔记','记录生活的第一篇笔记吧']:profileTab==='favorites'?['♡','还没有收藏内容','喜欢的内容会保存在这里']:profileTab==='history'?['◷','暂无浏览记录','看过的内容会显示在这里']:['♡','还没有赞过的内容','点亮喜欢的内容后会显示在这里'];
    c.innerHTML=wrap('<div class="xhs-scroll"><div class="xhs-profile"><div class="xhs-profile-head"><img class="xhs-p5-avatar" src="xhs-assets/p5-avatar.jpg" alt="momo头像"><div><strong>momo</strong><small>小红书号：momo_0716</small><small>IP属地：韩国</small></div><button class="xhs-edit">编辑资料</button></div><div class="xhs-stats"><div><b>'+following+'</b><span>关注</span></div><div><b>0</b><span>粉丝</span></div><div><b>0</b><span>获赞与收藏</span></div></div><p class="xhs-bio">慢慢生活，收集喜欢的小事 ✨</p><div class="xhs-profile-buttons"><button data-action="xhs-profile-tab" data-tab="notes">笔记</button><button data-action="xhs-profile-tab" data-tab="favorites">收藏</button><button data-action="xhs-profile-tab" data-tab="history">浏览记录</button></div><div class="xhs-profile-tabs"><button class="'+(profileTab==='notes'?'active':'')+'" data-action="xhs-profile-tab" data-tab="notes">笔记</button><button class="'+(profileTab==='favorites'?'active':'')+'" data-action="xhs-profile-tab" data-tab="favorites">收藏</button><button class="'+(profileTab==='likes'?'active':'')+'" data-action="xhs-profile-tab" data-tab="likes">赞过</button></div><div class="xhs-empty"><div class="xhs-empty-ico">'+empty[0]+'</div><b>'+empty[1]+'</b><p>'+empty[2]+'</p></div></div></div>'+nav('me'),'');return;
  }
  if(tab==='mall'){
    const groups=[['全部','▦'],['美妆护肤','♡'],['个护清洁','✧'],['服饰鞋包','◇'],['数码家电','▣'],['食品饮料','♧'],['家居生活','⌂'],['运动户外','⚑']];
    const goods=[['日常护肤套装','温和清洁 · 补水保湿','¥89','xhs-assets/beauty_01.jpg'],['清透防晒乳','轻薄不黏腻 · 日常通勤','¥59','xhs-assets/beauty_02.jpg'],['基础洁面乳','温和清洁 · 清爽肤感','¥39','xhs-assets/beauty_03.jpg'],['润唇护理套装','滋润保湿 · 清爽不厚重','¥29','xhs-assets/beauty_04.jpg']];
    c.innerHTML=wrap('<div class="xhs-scroll xhs-mall-scroll"><div class="xhs-searchbar" data-action="xhs-search-open"><span>⌕　搜索商品</span><button type="button">搜索</button></div><div class="xhs-mall-banner"><b>发现喜欢的好物</b><span>精选日常好物 · 慢慢挑选</span></div><div class="xhs-mall-categories">'+groups.map(g=>'<button type="button"><i>'+g[1]+'</i><span>'+g[0]+'</span></button>').join('')+'</div><div class="xhs-mall-section"><b>为你推荐</b><small>精选商品</small></div><div class="xhs-goods-grid">'+goods.map(g=>'<article class="xhs-goods-card"><img src="'+g[3]+'" alt="'+g[0]+'"><div><b>'+g[0]+'</b><p>'+g[1]+'</p><strong>'+g[2]+'</strong></div></article>').join('')+'</div></div>'+nav('mall'),'');return;
  }
  const visible=category==='推荐'?feed:feed.filter(p=>p[0]===category);
  c.innerHTML=wrap('<div class="xhs-scroll"><div class="xhs-searchbar" data-action="xhs-search-open"><span>⌕　搜索你感兴趣的内容</span><button type="button">搜索</button></div><div class="xhs-tabs">'+categories.map(k=>'<button class="'+(category===k?'active':'')+'" data-action="xhs-category" data-category="'+k+'">'+k+'</button>').join('')+'</div><div class="xhs-feed-title">为你推荐</div><div class="xhs-masonry">'+visible.map(card).join('')+'</div></div>'+nav('home'),'');return;
}
if(name==='browser'){
  c.innerHTML=wrap(`<div class="browser-home"><form class="browser-form" id="browserForm"><span>🔒</span><input id="browserUrl" placeholder="搜索或输入网站名称" value="https://www.apple.com"><button>前往</button></form><div class="browser-welcome"><div class="browser-compass">🧭</div><h2>搜索，或输入网站</h2><p>快速访问你常用的网站</p></div><div class="browser-favorites-title">个人收藏</div><div class="browser-shortcuts">${[['Apple','','https://www.apple.com'],['Bing','B','https://www.bing.com'],['GitHub','⌘','https://github.com']].map(x=>`<button data-url="${x[2]}"><span>${x[1]}</span><b>${x[0]}</b></button>`).join('')}</div><div class="browser-privacy"><span>🛡️</span><div><b>隐私浏览</b><small>网页将在新标签页中打开。模拟器不会直接嵌入外部网页。</small></div></div><div class="browser-bottom" aria-hidden="true"><span>‹</span><span>›</span><span>↑</span><span>▤</span><span>▢</span></div></div>`,'');return;
 }
 if(name==='camera')return;
 c.innerHTML=wrap(`<div class="sim-app-hero">${icons[name]||'📱'}</div><h2>${appNames[name]||name}</h2><p class="sim-muted">欢迎使用${appNames[name]||name}。</p><div class="sim-card"><h3>功能说明</h3><p>浏览并使用这里的功能。</p>${actionButton('返回桌面','go-home')}</div>`,'欢迎使用');
}
function openPhotoViewer(src,index=0){let viewer=$('#photoViewer');if(!viewer){viewer=document.createElement('div');viewer.id='photoViewer';viewer.className='photo-viewer';viewer.innerHTML='<button class="photo-viewer-close" aria-label="返回">‹</button><span class="photo-viewer-index"></span><img alt="照片大图">';$('.phone-frame').appendChild(viewer);viewer.addEventListener('click',e=>{if(e.target===viewer||e.target.closest('.photo-viewer-close'))viewer.classList.remove('open')})}viewer.querySelector('img').src=src;viewer.querySelector('.photo-viewer-index').textContent=String(index+1);viewer.classList.add('open')}
function contactRow(p,i){return `<div class="sim-list-row">${avatarMarkup(p.name)}<span><b>${esc(p.name)}</b><small>${esc(p.phone)}</small><small>${esc(p.note||'')}</small></span></div>`}
function editorNote(index=null){const n=index===null?{title:'',body:''}:saved.notes[index];$('#noteEditor').innerHTML=`<div class="editor-card notes-editor"><input id="noteTitle" class="notes-title-input" value="${esc(n.title)}" placeholder="标题"><textarea id="noteBody" class="notes-body-input" rows="8" placeholder="开始输入...">${esc(n.body)}</textarea><div class="notes-editor-actions">${actionButton('完成','save-note')}${actionButton('取消','cancel-editor','secondary')}</div><input type="hidden" id="noteIndex" value="${index===null?'':index}"></div>`}
function renderEditor(id,html){const el=$('#'+id);if(el)el.innerHTML=html}
function createCallId(){return 'call-'+Date.now().toString(36)+'-'+Math.random().toString(36).slice(2,9)}
let phoneCallTimer=null;
let callRingContext=null;
let callRingInterval=null;
let callRingOscillators=[];
function stopCallRingtone(){if(callRingInterval){clearInterval(callRingInterval);callRingInterval=null}callRingOscillators.forEach(o=>{try{o.stop()}catch(_){}});callRingOscillators=[]}
function startCallRingtone(){stopCallRingtone();try{const AudioCtor=window.AudioContext||window.webkitAudioContext;if(!AudioCtor)return;callRingContext=callRingContext||new AudioCtor();if(callRingContext.state==='suspended')callRingContext.resume().catch(()=>{});const ringOnce=()=>{if(!callRingContext||callRingContext.state!=='running')return;const osc=callRingContext.createOscillator(),gain=callRingContext.createGain(),now=callRingContext.currentTime;osc.type='sine';osc.frequency.setValueAtTime(400,now);gain.gain.setValueAtTime(0.0001,now);gain.gain.exponentialRampToValueAtTime(0.12,now+0.04);gain.gain.setValueAtTime(0.12,now+0.62);gain.gain.exponentialRampToValueAtTime(0.0001,now+0.72);osc.connect(gain);gain.connect(callRingContext.destination);callRingOscillators.push(osc);osc.onended=()=>{callRingOscillators=callRingOscillators.filter(x=>x!==osc);try{osc.disconnect();gain.disconnect()}catch(_){}};osc.start(now);osc.stop(now+0.74)};ringOnce();callRingInterval=setInterval(ringOnce,1800)}catch(_){stopCallRingtone()}}
function finishPhoneCall(){if(phoneCallTimer){clearTimeout(phoneCallTimer);phoneCallTimer=null}stopCallRingtone();document.querySelector('.phone-call-overlay')?.remove()}
function finishKakaoVoiceCall(){stopCallRingtone();document.querySelector('#kakaoVoiceCallOverlay')?.remove()}
function startKakaoVoiceCall(person){finishKakaoVoiceCall();const host=$('#appContent');if(!host)return;const contact=(saved.contacts||[]).find(x=>x.name===person)||{};const overlay=document.createElement('div');overlay.id='kakaoVoiceCallOverlay';overlay.className='kakao-voice-call-overlay';overlay.innerHTML=`<div class="kakao-call-info">${avatarMarkup(person,'kakao-call-avatar')}<strong>${esc(person)}</strong><span>语音通话</span><small class="kakao-call-status">正在呼叫…</small></div><div class="kakao-call-controls"><button type="button" class="phone-hangup" data-action="kakao-call-end" aria-label="挂断">📞</button></div>`;host.append(overlay);startCallRingtone()}
function startPhoneCall(number,name){if(!number)return;finishPhoneCall();saved.calls=saved.calls||[];saved.calls.unshift({id:createCallId(),name:name||number,number,type:'呼出',time:new Date().toLocaleString()});persist();const host=document.querySelector('.phone-app');if(!host)return;const overlay=document.createElement('div');overlay.className='phone-call-overlay';overlay.innerHTML=`<div class="phone-call-info"><div class="phone-call-avatar">${avatarMarkup(name||number,'phone-call-photo')}</div><strong>${esc(name||number)}</strong><span>${esc(number)}</span><small class="phone-call-status">正在呼叫…</small></div><button type="button" class="phone-hangup" data-action="phone-call-end" aria-label="挂断">📞</button>`;host.append(overlay);startCallRingtone();phoneCallTimer=setTimeout(finishPhoneCall,4500)}
appContent.addEventListener('click',async e=>{
 const act=e.target.closest('[data-action]')?.dataset.action;
 if(act){
  if(act==='xhs-search-open'){saved.xhsTab='search';saved.xhsQuery='';persist();renderApp('xiaohongshu');setTimeout(()=>$('#xhsSearchInput')?.focus(),40);return}
  if(act==='xhs-search-back'){saved.xhsTab='home';persist();renderApp('xiaohongshu');return}
 if(act==='xhs-clear-history'){
  saved.xhsSearchHistory=[];
  saved.xhsSearchHistoryCleared=true;
  persist();
  renderApp('xiaohongshu');
  return;
}
  if(act==='xhs-history-item'||act==='xhs-suggestion'){
    const q=e.target.closest('[data-query]')?.dataset.query||'';if(!q)return;
    saved.xhsQuery=q;saved.xhsSearchHistory=[q,...(saved.xhsSearchHistory||[]).filter(x=>x!==q)].slice(0,12);saved.xhsTab='search-results';persist();renderApp('xiaohongshu');return;
  }
  if(act==='xhs-tab'){saved.xhsTab=e.target.closest('[data-tab]')?.dataset.tab||'home';persist();renderApp('xiaohongshu');return}
  if(act==='xhs-category'){saved.xhsCategory=e.target.closest('[data-category]')?.dataset.category||'推荐';saved.xhsTab='home';persist();renderApp('xiaohongshu');return}
  if(act==='xhs-profile-tab'){saved.xhsProfileTab=e.target.closest('[data-tab]')?.dataset.tab||'notes';saved.xhsTab='me';persist();renderApp('xiaohongshu');return}
  const index=Number(e.target.closest('[data-index]')?.dataset.index);
  if(act==='focus-chat-search'){$('#chatListSearch')?.focus();return}
  if(act==='kakao-translate'){saved.kakaoTranslate=!saved.kakaoTranslate;persist();renderChatThread('kakaotalk',activeChat);return}
  if(act==='kakao-inline-translate'){const who=e.target.closest('[data-person]')?.dataset.person,idx=e.target.closest('[data-index]')?.dataset.index,key=who+'_'+idx;saved.kakaoTranslations=saved.kakaoTranslations||{};saved.kakaoTranslations[key]=!saved.kakaoTranslations[key];persist();renderChatThread('kakaotalk',who);return}
  if(act==='social-tab'){renderSocialLanding(currentApp,e.target.closest('[data-tab]')?.dataset.tab||'chats');return}
  if(act==='open-social-contact'){const person=e.target.closest('[data-person]')?.dataset.person;if(person)renderSocialContact(currentApp,person);return}
  if(act==='social-detail-back'){renderSocialLanding(currentApp,saved[currentApp+'Tab']||'chats');return}
  if(act==='social-contact-message'){const person=e.target.closest('[data-person]')?.dataset.person;if(person)renderChatThread(currentApp,person);return}
  if(act==='open-chat-settings'||act==='open-social-chat-settings'){renderSocialChatSettings(currentApp,activeChat||e.target.closest('[data-person]')?.dataset.person||'');return}
  if(act==='social-more'){renderSocialMore(currentApp);return}
  if(act==='social-feature'){toast((e.target.closest('[data-feature]')?.dataset.feature||'功能')+'（模拟入口）');return}
  if(act==='clear-chat-history'){const person=e.target.closest('[data-person]')?.dataset.person,item=(saved[currentApp]||[]).find(x=>x.to===person);if(item){item.thread=[];item.body='';persist();renderSocialChatSettings(currentApp,person);toast('聊天记录已清空')}return}
  if(act==='social-contact-call'){const person=e.target.closest('[data-person]')?.dataset.person||activeChat||'联系人';startKakaoVoiceCall(person);return}if(act==='kakao-call-end'){finishKakaoVoiceCall();return}
  if(act==='voice-play'){const button=e.target.closest('.kakao-voice-play'),bubble=button?.closest('.kakao-voice-bubble'),audio=bubble?.querySelector('audio');if(!audio||!button)return;if(audio.paused){if(audio.readyState<4&&!(audio.duration>0&&audio.buffered.length>0&&audio.buffered.end(audio.buffered.length-1)>=audio.duration-.15)){button.disabled=true;button.setAttribute('aria-label','语音加载中');audio.load();return}document.querySelectorAll('.kakao-voice-audio').forEach(other=>{if(other!==audio)other.pause()});const result=audio.play();if(result&&typeof result.catch==='function')result.catch(()=>{button.textContent='▶';toast('语音播放失败')});}else audio.pause();return}
  if(act==='message-copy'||act==='message-recall'||act==='message-delete'||act==='message-transcribe'){
   const row=e.target.closest('.chat-message-actions'),idx=Number(row?.dataset.messageIndex),item=(saved[currentApp]||[]).find(x=>x.to===activeChat),msg=item?.thread?.[idx];
   if(!msg)return;
   if(act==='message-transcribe'){if(msg.type!=='voice')return;msg.transcript=msg.transcript||'就这么喜欢哥哥吗？真是疯了。';msg.showTranscript=true;persist();renderChatThread(currentApp,activeChat);return}
   if(act==='message-copy'){const value=msg.text||'';if(navigator.clipboard?.writeText)navigator.clipboard.writeText(value).then(()=>toast('已复制消息')).catch(()=>toast('复制失败，请检查浏览器权限'));else{const ta=document.createElement('textarea');ta.value=value;document.body.append(ta);ta.select();document.execCommand('copy');ta.remove();toast('已复制消息')}}
   if(act==='message-recall'){if(msg.from!=='me'){toast('只能撤回自己发送的消息');return}msg.recalled=true;msg.text='';item.body='你撤回了一条消息';persist();renderChatThread(currentApp,activeChat);toast('已撤回消息')}
   if(act==='message-delete'){item.thread.splice(idx,1);const latest=item.thread[item.thread.length-1];item.body=latest?.text||'';item.date=latest?.date||'刚刚';persist();renderChatThread(currentApp,activeChat);toast('已删除消息')}
   return;
  }
  if(act==='message-menu-close'){appContent.querySelectorAll('.chat-message-actions').forEach(el=>el.remove());return}
  if(act==='open-chat'){const person=e.target.closest('[data-person]')?.dataset.person;if(person)renderChatThread(currentApp,person);return}
  if(act==='chat-back'){activeChat=null;renderApp(currentApp);return}
  if(act==='open-chat-settings'){renderSocialChatSettings(currentApp,activeChat||'');return}
  if(act==='send-chat'){const input=$('#chatInput'),typed=input?.value.trim();if(!typed||!activeChat)return;const item=(saved[currentApp]||[]).find(x=>x.to===activeChat);if(!item)return;const lang=outgoingLanguage(currentApp,activeChat),text=lang==='ko'?translateToKoreanLocal(typed):typed;item.thread=item.thread||[];item.thread.push({from:'me',text,date:new Date().toLocaleTimeString([], {hour:'2-digit',minute:'2-digit'})});item.body=text;item.date='刚刚';persist();if(currentApp==='kakaotalk')updateLockKakaoNotification();renderChatThread(currentApp,activeChat);return}
  if(act==='ig-section'){saved.igSection=e.target.closest('[data-section]')?.dataset.section||'home';persist();renderApp('instagram');return}
  if(act==='ig-profile-tab'){saved.igProfileTab=e.target.closest('[data-tab]')?.dataset.tab||'grid';persist();renderApp('instagram');return}
  if(act==='ig-open-story'){toast('正在查看 '+(e.target.closest('[data-user]')?.dataset.user||'好友')+' 的快拍');return}
  if(act==='social-like'){const el=e.target.closest('[data-user]'),network=el?.dataset.network,user=el?.dataset.user;if(!network||!user)return;saved.socialLikes=saved.socialLikes||{};saved.socialLikes[network]=saved.socialLikes[network]||{};saved.socialLikes[network][user]=!saved.socialLikes[network][user];persist();renderApp(currentApp);return}
  if(act==='x-tab'){saved.xTab=e.target.closest('[data-tab]')?.dataset.tab||'for-you';saved.xSection='home';persist();renderApp('x');return}
  if(act==='x-menu-toggle'){saved.xMenuOpen=true;persist();renderApp('x');return}
  if(act==='x-menu-close'){saved.xMenuOpen=false;persist();renderApp('x');return}
  if(act==='x-menu-profile'){saved.xMenuOpen=false;saved.xSection='profile';persist();renderApp('x');return}
  if(act==='x-dm-open'){toast('已打开与 '+(e.target.closest('[data-user]')?.dataset.user||'好友')+' 的私信');return}
  if(act==='x-section'){saved.xSection=e.target.closest('[data-section]')?.dataset.section||'home';persist();renderApp('x');return}
  if(act==='x-reply'){const post=e.target.closest('[data-index]');const i=Number(post?.dataset.index||0);const friends=(saved.xFollowing||['shinyu','dohoon','youngjae','jihoon','kyungmin']);const names=['shinyu','dohoon','youngjae','jihoon','kyungmin'];saved.xReplyOpen=names[i]||names[0];persist();renderApp('x');return}
  if(act==='x-publish-reply'){const u=e.target.closest('[data-user]')?.dataset.user,body=$('#xReplyInput')?.value.trim();if(!body||!u){toast('先写下回复内容');return}saved.xReplies=saved.xReplies||{};saved.xReplies[u]=saved.xReplies[u]||[];saved.xReplies[u].push(body);persist();renderApp('x');return}
  if(act==='x-repost'){toast('已模拟转发');return}
  if(act==='new-note')editorNote();
  if(act==='edit-note')editorNote(index);
  if(act==='cancel-editor')renderEditor('noteEditor','');
  if(act==='save-note'){const title=$('#noteTitle').value.trim(),body=$('#noteBody').value.trim(),v=$('#noteIndex').value;if(!body&&!title){toast('先写一点内容吧');return}saved.notes=saved.notes||[];const item={title:title||'新备忘录',body,date:new Date().toLocaleString()};if(v==='')saved.notes.unshift(item);else saved.notes[Number(v)]=item;persist();renderApp('notes');toast('备忘录已保存')}
  if(act==='new-contact')renderEditor('contactEditor',`<div class="editor-card">${field('姓名','newContactName','','输入姓名')}${field('电话号码','newContactPhone','','输入号码')}${field('备注','newContactNote','','选填')}${actionButton('保存联系人','save-contact')}${actionButton('取消','cancel-contact','secondary')}</div>`);
  if(act==='cancel-contact')renderEditor('contactEditor','');
  if(act==='save-contact'){const name=$('#newContactName').value.trim(),phone=$('#newContactPhone').value.trim(),note=$('#newContactNote').value.trim();if(!name){toast('请填写姓名');return}saved.contacts=saved.contacts||[{name:'小雨',phone:'138 0000 1107',note:'好朋友'},{name:'妈妈',phone:'138 0000 0001',note:'家人'}];saved.contacts.unshift({name,phone,note});persist();renderApp(currentApp==='phone'?'phone':'contacts');toast('联系人已保存')}
  if(act==='delete-contact'){saved.contacts.splice(index,1);persist();renderApp('contacts')}
  if(act==='open-photo'){const photo=(saved.photos||[])[index];if(photo)openPhotoViewer(photo.data,index)}
  if(act==='open-post-image'){const post=(saved['posts_'+currentApp]||[])[index];if(post?.image)openPhotoViewer(post.image,index)}
  if(act==='x-new-post'){saved.xComposerOpen=true;persist();renderApp('x');return}
  if(act==='x-cancel-post'){saved.xComposerOpen=false;persist();renderApp('x');return}
  if(act==='x-publish-post'){const body=$('#xPostBody')?.value.trim();if(!body){toast('先写点内容再发帖');return}const file=$('#xPostImage')?.files?.[0];const publish=data=>{saved.posts_x=saved.posts_x||[];saved.posts_x.unshift({title:'',body,image:data||'',likes:0});saved.xComposerOpen=false;persist();renderApp('x');toast('已发布')};if(file){const r=new FileReader();r.onload=()=>publish(r.result);r.readAsDataURL(file)}else publish('')}
  if(act==='delete-recording'){saved.recordings.splice(index,1);persist();renderApp('voice')}
  if(act==='new-message'){const mail=currentApp==='mail';renderEditor('messageEditor',`<div class="editor-card mail-compose">${field(mail?'收件人':'联系人','msgTo','','输入姓名或邮箱地址')}${mail?field('主题','msgSubject','','邮件主题'):''}<label class="sim-field">内容<textarea id="msgBody" rows="5" placeholder="写点什么…"></textarea></label>${actionButton(mail?'存入已发送':'保存到模拟收件箱','save-message')}${actionButton('取消','cancel-message','secondary')}</div>`)}
  if(act==='cancel-message')renderEditor('messageEditor','');
  if(act==='save-message'){const to=$('#msgTo').value.trim()||'新对话',body=$('#msgBody').value.trim(),subject=currentApp==='mail'?($('#msgSubject')?.value.trim()||'（无主题）'):'';if(!body){toast('请输入内容');return}saved[currentApp]=saved[currentApp]||[];saved[currentApp].unshift({to,body,subject,date:new Date().toLocaleString()});persist();renderApp(currentApp);toast(currentApp==='mail'?'邮件已保存到发件箱':'已保存')}
  if(act==='delete-message'){saved[currentApp].splice(index,1);persist();renderApp(currentApp)}
  if(act==='new-post')renderEditor('postEditor',`<div class="editor-card">${field('标题','postTitle','','给这条动态起个标题')}<label class="sim-field">内容<textarea id="postBody" rows="4" placeholder="分享你的生活..."></textarea></label><label class="sim-field">添加图片（选填）<input type="file" id="postImage" accept="image/*"></label>${actionButton('发布','publish-post')}${actionButton('取消','cancel-post','secondary')}</div>`);
  if(act==='cancel-post')renderEditor('postEditor','');
  if(act==='publish-post'){const body=$('#postBody').value.trim(),title=$('#postTitle').value.trim();if(!body&&!title){toast('写点内容再发布吧');return}const file=$('#postImage').files[0];const publish=data=>{const key='posts_'+currentApp;saved[key]=saved[key]||[];saved[key].unshift({title,body,image:data||'',likes:0});persist();renderApp(currentApp);toast('动态已发布到本地')};if(file){const r=new FileReader();r.onload=()=>publish(r.result);r.readAsDataURL(file)}else publish('')}
  if(act==='like-post'){const arr=saved['posts_'+currentApp];arr[index].likes=(arr[index].likes||0)+1;persist();renderApp(currentApp)}
  if(act==='delete-post'){saved['posts_'+currentApp].splice(index,1);persist();renderApp(currentApp)}
  if(act==='go-home'){closeApp()}
  if(act==='change-lock'||act==='change-home'){const input=document.createElement('input');input.type='file';input.accept='image/*';input.onchange=()=>{const f=input.files[0];if(!f)return;const r=new FileReader();r.onload=()=>{const bg=act==='change-lock'?'.lock-bg':'.home-bg';$(bg).style.backgroundImage=`url("${r.result}")`;try{localStorage.setItem('ryryry-'+act,r.result)}catch(e){toast('图片太大，已临时更换但无法持久保存')}};r.readAsDataURL(f)};input.click()}
  if(act==='reset-data'){if(confirm('确定清除模拟器保存的备忘录、联系人、动态和设置吗？')){localStorage.removeItem(STORE);Object.keys(saved).forEach(k=>delete saved[k]);renderApp('settings');toast('本地模拟数据已重置')}}
  if(act==='add-event'){const selected=saved.calendarSelected||new Date().toISOString().slice(0,10);renderEditor('eventList',`<div class="editor-card calendar-editor">${field('日程名称','eventTitle','','输入日程')}<label class="sim-field">日期与时间<input id="eventDate" type="datetime-local" value="${selected}T09:00"></label>${actionButton('保存日程','save-event')}${actionButton('取消','cancel-event','secondary')}</div>`)}
  if(act==='save-event'){const title=$('#eventTitle').value.trim(),date=$('#eventDate').value;if(!title){toast('请输入日程名称');return}saved.events=saved.events||[];saved.events.push({title,date:date||'未设置时间'});saved.calendarSelected=(date||'').slice(0,10)||saved.calendarSelected;persist();renderApp('calendar')}
  if(act==='cancel-event')renderApp('calendar');
  if(act==='calendar-prev'||act==='calendar-next'){const [y,m]=(saved.calendarMonth||new Date().toISOString().slice(0,7)).split('-').map(Number),d=new Date(y,m-1+(act==='calendar-next'?1:-1),1);saved.calendarMonth=d.getFullYear()+'-'+String(d.getMonth()+1).padStart(2,'0');persist();renderApp('calendar');return}
  if(act==='calendar-today'){saved.calendarMonth=new Date().toISOString().slice(0,7);saved.calendarSelected=new Date().toISOString().slice(0,10);persist();renderApp('calendar');return}
  if(act==='calendar-select-day'){saved.calendarSelected=e.target.closest('[data-date]')?.dataset.date||saved.calendarSelected;persist();renderApp('calendar');return}
  if(act==='delete-event'){saved.events.splice(index,1);persist();renderApp('calendar')}
  if(act==='phone-tab'){saved.phoneTab=e.target.closest('[data-tab]')?.dataset.tab||'recent';persist();renderApp('phone');return}
  if(act==='phone-filter'){saved.phoneFilter=e.target.closest('[data-filter]')?.dataset.filter||'all';persist();renderApp('phone');return}
  if(act==='phone-edit-recent'){saved.phoneEditing=!saved.phoneEditing;persist();renderApp('phone');return}
  if(act==='phone-delete-call'){const callId=e.target.closest('[data-call-id]')?.dataset.callId;saved.calls=(saved.calls||[]).filter(item=>item.id!==callId);persist();renderApp('phone');return}
  if(act==='phone-key'){const d=$('#dialNumber');if(d){d.value+=e.target.closest('[data-key]').dataset.key;saved.phoneDialNumber=d.value;persist()}}
  if(act==='phone-backspace'){const d=$('#dialNumber');if(d){d.value=d.value.slice(0,-1);saved.phoneDialNumber=d.value;persist()}}
  if(act==='phone-contact-call'){const name=e.target.closest('[data-person]')?.dataset.person,p=(saved.contacts||[]).find(x=>x.name===name);if(p)startPhoneCall(p.phone,p.name);return}
  if(act==='phone-call-row'){const callId=e.target.closest('[data-call-id]')?.dataset.callId,p=(saved.calls||[]).find(item=>item.id===callId);if(p)startPhoneCall(p.number,p.name);return}
  if(act==='phone-clear-recent'){if(confirm('清空最近通话记录？')){saved.calls=[];persist();renderApp('phone')}return}
  if(act==='phone-add-favorite'){toast('个人收藏可通过联系人列表中的常用联系人管理（演示）');return}
  if(act==='dial-delete'){const d=$('#dialNumber');if(d){d.value=d.value.slice(0,-1);d.focus()}}
  if(act==='dial-call'){const number=$('#dialNumber')?.value.trim();saved.phoneDialNumber=number||'';if(!number){$('#dialNumber')?.focus();return}const person=(saved.contacts||[]).find(p=>p.phone.replace(/\s/g,'')===number.replace(/\s/g,''));startPhoneCall(number,person?.name||number)}
  if(act==='phone-call-end'){finishPhoneCall()}
  if(act==='call-contact'){const p=(saved.calls||[])[index];if(p){const d=$('#dialNumber');if(d){d.value=p.number||'';d.focus();d.setSelectionRange(d.value.length,d.value.length)}}}if(act==='open-mail'){const m=(saved.mail||[])[index];if(m){const subject=m.subject||((m.body||'').match(/^主题：([^\n]+)/)?.[1])||'（无主题）',body=(m.body||'').replace(/^主题：[^\n]+\n?/,'');renderEditor('messageEditor',`<article class="mail-detail"><button type="button" class="mail-detail-back" data-action="close-mail-detail">‹ 收件箱</button><h2>${esc(subject)}</h2><div class="mail-detail-meta"><b>${esc(m.to||'未知发件人')}</b><small>${esc(m.date||'')}</small></div><p>${esc(body)}</p></article>`);}}if(act==='close-mail-detail')renderEditor('messageEditor','');
  if(act==='open-camera-gallery'){openApp('photos');return}if(act==='record-start')startRecording();
  if(act==='record-stop')stopRecording();
 }
 const shortcut=e.target.closest('[data-url]');if(shortcut)window.open(shortcut.dataset.url,'_blank','noopener');
});
let chatPressTimer=null;
appContent.addEventListener('pointerdown',e=>{const line=e.target.closest('.chat-line[data-message-index]');if(!line)return;clearTimeout(chatPressTimer);chatPressTimer=setTimeout(()=>{const host=$('#chatActionHost');if(!host)return;const idx=Number(line.dataset.messageIndex),msg=(saved[currentApp]||[]).find(x=>x.to===activeChat)?.thread?.[idx];if(!msg)return;appContent.querySelectorAll('.chat-message-actions').forEach(el=>el.remove());line.querySelector('.chat-message-actions')?.remove();line.insertAdjacentHTML('beforeend','<div class="chat-message-actions" data-message-index="'+idx+'"><button data-action="message-copy">复制</button>'+(msg.type==='voice'?'<button data-action="message-transcribe">转文字</button>':'')+(msg.from==='me'&&!msg.recalled?'<button data-action="message-recall">撤回</button>':'')+'<button data-action="message-delete">删除</button><button data-action="message-menu-close">取消</button></div>');},520)});
appContent.addEventListener('pointerup',()=>clearTimeout(chatPressTimer));
appContent.addEventListener('pointercancel',()=>clearTimeout(chatPressTimer));
appContent.addEventListener('contextmenu',e=>{const line=e.target.closest('.chat-line[data-message-index]');if(!line)return;e.preventDefault();clearTimeout(chatPressTimer);const host=$('#chatActionHost'),idx=Number(line.dataset.messageIndex),msg=(saved[currentApp]||[]).find(x=>x.to===activeChat)?.thread?.[idx];if(!host||!msg)return;appContent.querySelectorAll('.chat-message-actions').forEach(el=>el.remove());line.querySelector('.chat-message-actions')?.remove();line.insertAdjacentHTML('beforeend','<div class="chat-message-actions" data-message-index="'+idx+'"><button data-action="message-copy">复制</button>'+(msg.type==='voice'?'<button data-action="message-transcribe">转文字</button>':'')+(msg.from==='me'&&!msg.recalled?'<button data-action="message-recall">撤回</button>':'')+'<button data-action="message-delete">删除</button><button data-action="message-menu-close">取消</button></div>');});
appContent.addEventListener('keydown',e=>{if(e.target.id==='chatInput'&&e.key==='Enter'){e.preventDefault();const b=appContent.querySelector('[data-action="send-chat"]');b?.click()}});
appContent.addEventListener('change',e=>{
 if(e.target.matches('[data-chat-setting]')){const person=e.target.dataset.person;let item=(saved[currentApp]||[]).find(x=>x.to===person);if(!item){item={to:person,thread:[]};saved[currentApp].push(item)}if(e.target.dataset.chatSetting==='mute')item.muted=e.target.checked;if(e.target.dataset.chatSetting==='pinned')item.pinned=e.target.checked;if(e.target.dataset.chatSetting==='saved')item.savedContact=e.target.checked;persist();toast('聊天设置已保存')}
 if(e.target.matches('[data-setting]')){saved.settings=saved.settings||{};saved.settings[e.target.dataset.setting]=e.target.checked;persist();document.body.classList.toggle('sim-dark',!!saved.settings.dark);toast('设置已保存')}
 if(e.target.id==='cameraUpload'){const files=[...e.target.files];files.forEach(file=>{const reader=new FileReader();reader.onload=()=>{$('#cameraPreview').innerHTML=`<img class="camera-result" src="${reader.result}" alt="拍摄预览"><span class="camera-preview-label">已拍摄并保存</span>`;saved.photos=saved.photos||[];saved.photos.unshift({data:reader.result});persist();toast('照片已保存到相册')};reader.readAsDataURL(file)})}
});
appContent.addEventListener('submit',e=>{
 if(e.target&&e.target.id==='xhsSearchForm'){
  e.preventDefault();const q=($('#xhsSearchInput')?.value||'').trim();if(!q){toast('请输入搜索内容');return}
  saved.xhsQuery=q;saved.xhsSearchHistory=[q,...(saved.xhsSearchHistory||[]).filter(x=>x!==q)].slice(0,12);saved.xhsTab='search-results';persist();renderApp('xiaohongshu');
 }
});
appContent.addEventListener('input',e=>{
 if(e.target.id==='notesSearch'){const q=e.target.value.trim().toLowerCase();$('.notes-row').forEach(row=>row.style.display=row.textContent.toLowerCase().includes(q)?'':'none')}
 if(e.target.id==='contactSearch'){const q=e.target.value.toLowerCase();$('#contactList .sim-list-row').forEach(row=>row.style.display=row.textContent.toLowerCase().includes(q)?'':'none')}
 if(e.target.id==='chatListSearch'){const q=e.target.value.trim().toLowerCase();$('.social-message-list .message-row').forEach(row=>row.style.display=row.textContent.toLowerCase().includes(q)?'':'none')}
 if(e.target.id==='socialContactSearch'){const q=e.target.value.trim().toLowerCase();$('.social-list .social-row').forEach(row=>row.style.display=row.textContent.toLowerCase().includes(q)?'':'none')}
});
let mediaRecorder=null,recordChunks=[],recordStartedAt=0,recordTimerInterval=null;
function updateRecordTimer(){const el=$('#recordTimer');if(!el||!recordStartedAt)return;const seconds=Math.floor((Date.now()-recordStartedAt)/1000);el.textContent=String(Math.floor(seconds/60)).padStart(2,'0')+':'+String(seconds%60).padStart(2,'0')}
async function startRecording(){try{if(mediaRecorder&&mediaRecorder.state==='recording')return;if(!navigator.mediaDevices?.getUserMedia)throw new Error('浏览器不支持麦克风录音');const stream=await navigator.mediaDevices.getUserMedia({audio:true});recordChunks=[];recordStartedAt=Date.now();mediaRecorder=new MediaRecorder(stream);mediaRecorder.ondataavailable=e=>{if(e.data.size)recordChunks.push(e.data)};mediaRecorder.onstop=()=>{if(recordTimerInterval){clearInterval(recordTimerInterval);recordTimerInterval=null}const duration=Math.floor((Date.now()-recordStartedAt)/1000);const blob=new Blob(recordChunks,{type:mediaRecorder.mimeType||'audio/webm'});const reader=new FileReader();reader.onload=()=>{saved.recordings=saved.recordings||[];saved.recordings.unshift({name:'录音 '+new Date().toLocaleTimeString(),date:new Date().toLocaleString(),duration,data:reader.result});persist();if(currentApp==='voice')renderApp('voice');toast('录音已保存')};reader.readAsDataURL(blob);stream.getTracks().forEach(t=>t.stop())};mediaRecorder.start();const status=$('#recordStatus');if(status)status.textContent='正在录音…';const recordButton=$('.voice-record-button');if(recordButton)recordButton.classList.add('recording');if(recordTimerInterval)clearInterval(recordTimerInterval);recordTimerInterval=setInterval(updateRecordTimer,250);updateRecordTimer();toast('录音开始')}catch(err){toast('无法录音：请使用 HTTPS 并允许麦克风权限')}}
function stopRecording(){if(mediaRecorder&&mediaRecorder.state!=='inactive'){mediaRecorder.stop();const status=$('#recordStatus');if(status)status.textContent='正在保存录音…'}else toast('当前没有正在进行的录音')}
appContent.addEventListener('submit',e=>{if(e.target.id==='browserForm'){e.preventDefault();let url=$('#browserUrl').value.trim();if(!url)return;if(!/^https?:\/\//i.test(url)){url=/\./.test(url)&&!/\s/.test(url)?'https://'+url:'https://www.google.com/search?q='+encodeURIComponent(url)}window.open(url,'_blank','noopener');}});
function updateClock(){const now=new Date(),time=now.toLocaleTimeString('zh-CN',{hour:'2-digit',minute:'2-digit',hour12:false}),month=now.getMonth()+1,day=now.getDate(),week=['星期日','星期一','星期二','星期三','星期四','星期五','星期六'][now.getDay()],dateStr=`${month}月${day}日 ${week}`;['lockTime','lockStatusTime','statusTime'].forEach(id=>{const el=$('#'+id);if(el)el.textContent=time});if($('#lockDateTop'))$('#lockDateTop').textContent=dateStr;if($('#widgetCalDay'))$('#widgetCalDay').textContent=day;if($('#widgetCalWeek'))$('#widgetCalWeek').textContent=week;if($('#widgetCalMonth'))$('#widgetCalMonth').textContent=`${month}月`}
updateClock();setInterval(updateClock,1000);
try{const lock=localStorage.getItem('ryryry-change-lock'),home=localStorage.getItem('ryryry-change-home');if(lock) $('.lock-bg').style.backgroundImage=`url("${lock}")`;if(home) $('.home-bg').style.backgroundImage=`url("${home}")`;document.body.classList.toggle('sim-dark',!!saved.settings?.dark)}catch(e){}
