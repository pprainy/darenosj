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
// 搜索历史默认四条；显式清空后不自动补回。
if(!Array.isArray(saved.xhsSearchHistory))saved.xhsSearchHistory=[];
if(saved.xhsSearchHistory.length===0&&saved.xhsSearchHistoryCleared!==true){saved.xhsSearchHistory=['哥哥太受欢迎了不开心是正常的吗','韩国打卡地点推荐','礼山','太喜欢哥哥了怎么办'];}
persist();
const esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const avatarFiles={'申惟哥哥':'shinyu.jpg','道勋哥':'dohoon.jpg','英宰哥':'youngjae.jpg','志薰🪼':'jihoon.jpg','炅潣':'kyungmin.jpg'};
function avatarMarkup(name,cls='contact-avatar'){const file=avatarFiles[name];return file?`<span class="${cls} has-photo"><img src="avatars/${file}" alt="${esc(name)}" onerror="this.parentElement.classList.remove('has-photo');this.remove()"><i>${esc((name||'?').slice(0,1))}</i></span>`:`<span class="${cls}">${esc((name||'?').slice(0,1))}</span>`;}
function updateLockKakaoNotification(){const list=saved.kakaotalk||[], item=list[0], thread=Array.isArray(item?.thread)?item.thread:[], latest=thread[thread.length-1], sender=item?.to||'KakaoTalk', preview=latest?.text||item?.body||'你有一条新消息';const nameEl=$('#lockKakaoSender'),previewEl=$('#lockKakaoPreview');if(nameEl)nameEl.textContent=sender;if(previewEl)previewEl.textContent=preview;const card=$('#lockKakaoNotification');if(card)card.hidden=!item;}
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
function closeApp(){appView.classList.remove('open');appView.removeAttribute('data-app');currentApp='';activeChat=null;}
$('#backBtn').addEventListener('click',closeApp);
function openApp(name){currentApp=name;appView.dataset.app=name;appTitle.textContent=appNames[name]||name;renderApp(name);appView.classList.add('open');}
window.addEventListener('keydown',e=>{if(e.key==='Escape'&&appView.classList.contains('open'))closeApp()});
function actionButton(label,action,cls=''){return `<button class="sim-btn ${cls}" data-action="${action}">${label}</button>`}
function field(label,id,value='',placeholder=''){return `<label class="sim-field">${label}<input id="${id}" value="${esc(value)}" placeholder="${esc(placeholder)}"></label>`}
function emptyState(icon,title,desc=''){return `<div class="sim-empty"><div>${icon}</div><strong>${title}</strong><p>${desc}</p></div>`}
let activeChat=null;
const kakaoChinese={'오늘 뭐 해? 사진 보내줄게.':'今天在做什么？我给你发照片。','집 도착하면 알려줘!':'到家告诉我！','주말에 같이 밥 먹을래?':'周末一起吃饭吗？','ㅋㅋㅋ 방금 영상 진짜 웃겨':'哈哈，刚才的视频真的好好笑。','사진 너무 잘 나왔다!':'照片拍得真好！','밥 잘 챙겨 먹어.':'好好吃饭。','시간 되면 전화해 줘.':'有空给我打电话。','오늘 밤 게임할래?':'今晚一起打游戏吗？','링크 보냈어! 확인해 봐.':'我发链接了！看一下。','요즘 추우니까 따뜻하게 입어.':'最近冷，穿暖一点。','사진 보내줄게.':'我给你发照片。','같이 밥 먹을래?':'一起吃饭吗？','방금 영상 진짜 웃겨':'刚才的视频真的好好笑。','전화해 줘.':'给我打电话。','게임할래?':'要一起打游戏吗？','링크 보냈어!':'我发链接了！','따뜻하게 입어.':'穿暖一点。'};
function renderChatThread(app,person){
 activeChat=person;
 const isKakao=app==='kakaotalk', isWechat=app==='wechat';
 const all=saved[app]||[];let item=all.find(x=>x.to===person);
 if(!item){item={to:person,body:'',date:'刚刚',thread:[]};all.unshift(item);saved[app]=all;persist()}
 if(!Array.isArray(item.thread))item.thread=item.body?[{from:'them',text:item.body,date:item.date||'刚刚'}]:[];
 const bubbles=item.thread.map((m,i)=>{const show=isKakao&&saved.kakaoTranslations?.[person+'_'+i];const tr=kakaoChinese[m.text];return `<div class="chat-line ${m.from==='me'?'mine':'theirs'}" data-message-index="${i}"><div class="chat-bubble">${m.recalled?'你撤回了一条消息':esc(m.text)}</div>${isKakao&&tr?`<button class="kakao-inline-translate" data-action="kakao-inline-translate" data-person="${esc(person)}" data-index="${i}">${show?esc(tr):'翻译'}</button>`:''}<small>${esc(m.date||'')}</small></div>`}).join('');
 const navTitle=isKakao?person:isWechat?person:person;
 const tools=isKakao?'<button type="button" data-action="open-chat-settings" aria-label="聊天设置">⚙</button><button type="button" data-action="social-more" aria-label="更多">☰</button>':isWechat?'<button type="button" data-action="open-chat-settings" aria-label="聊天设置">⌕</button><button type="button" data-action="social-more" aria-label="更多">•••</button>':'<button type="button" data-action="social-more" aria-label="更多">•••</button>';
 appContent.innerHTML=`<div class="sim-app chat-app ${isKakao?'kakao-chat':isWechat?'wechat-chat':''}">
  <div class="chat-nav"><button type="button" data-action="chat-back" aria-label="返回">‹</button><button type="button" class="chat-nav-person" data-action="open-social-contact" data-person="${esc(person)}">${avatarMarkup(person,'chat-nav-avatar')}<strong>${esc(navTitle)}</strong></button><span class="chat-nav-tools">${tools}</span></div>
  <div class="chat-history" id="chatHistory">${bubbles||'<div class="chat-day">今天</div>'}</div><div id="chatActionHost"></div>
  <div class="chat-compose"><button type="button" class="chat-attach" aria-label="更多功能">＋</button><input id="chatInput" autocomplete="off" placeholder="${isKakao?'输入消息…':isWechat?'发送消息':'iMessage'}"><button type="button" data-action="send-chat">${isKakao?'发送':isWechat?'发送':'发送'}</button></div>
 </div>`;
 const history=$('#chatHistory');if(history)history.scrollTop=history.scrollHeight;
}
function renderSocialLanding(app,tab){
 const isKakao=app==='kakaotalk',key=app+'Tab',allPeople=saved.contacts||[],familySet=new Set(familyNames),people=isKakao?allPeople.filter(p=>!familySet.has(p.name)):allPeople.filter(p=>familySet.has(p.name)),chats=saved[app]||[];
 tab=tab||'chats';saved[key]=tab;persist();
 const tabs=isKakao?[['friends','好友','♙'],['chats','聊天','▢'],['open','开放聊天','◉'],['more','更多','•••']]:[['chats','微信','◉'],['contacts','通讯录','♙'],['discover','发现','⌕'],['me','我','☺']];
 const title=isKakao?({friends:'好友',chats:'聊天',open:'开放聊天',more:'更多'}[tab]||'KakaoTalk'):({chats:'聊天',contacts:'通讯录',discover:'发现',me:'我'}[tab]||'微信');
 let body='';
 if(tab==='chats'){
  const rows=[...chats].sort((a,b)=>Number(!!b.pinned)-Number(!!a.pinned)).map(m=>{const t=Array.isArray(m.thread)?m.thread:[],last=t[t.length-1];return '<button class="social-row" data-action="open-chat" data-person="'+esc(m.to)+'">'+avatarMarkup(m.to,isKakao?'contact-avatar kakao-list-avatar':'contact-avatar wechat-list-avatar')+'<span class="social-row-copy"><b>'+esc(m.to)+'</b><small>'+esc(last?.text||m.body||'点击进入聊天')+'</small></span><time>'+esc(last?.date||m.date||'刚刚')+'</time></button>'}).join('');
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
 appContent.innerHTML='<div class="sim-app social-shell '+app+'"><header class="social-chat-top"><h2>'+title+'</h2><div class="social-chat-tools">'+tools+'</div></header><main class="social-tab-content">'+body+'</main><nav class="social-tabbar">'+tabs.map(t=>'<button type="button" class="'+(tab===t[0]?'active':'')+'" data-action="social-tab" data-tab="'+t[0]+'"><span>'+t[2]+'</span><small>'+t[1]+'</small></button>').join('')+'</nav></div>';
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
  const notes=saved.notes||[];c.innerHTML=wrap(`<div class="sim-toolbar">${actionButton('＋ 新建备忘录','new-note')}</div><div id="noteEditor"></div><div class="sim-list">${notes.length?notes.map((n,i)=>`<button class="sim-list-row" data-action="edit-note" data-index="${i}"><span class="sim-row-icon">📝</span><span><b>${esc(n.title||'新备忘录')}</b><small>${esc(n.body||'没有其他内容')}</small></span><span>›</span></button>`).join(''):emptyState('📝','还没有备忘录','点击“新建备忘录”记录想法')}</div>`,'随手记录你的灵感');return;
 }
 if(name==='contacts'){
  const contacts=saved.contacts||[];
  c.innerHTML=wrap(`<div class="contacts-heading"><strong>联系人</strong><button class="phone-add" data-action="new-contact" aria-label="添加联系人">＋</button></div><div id="contactEditor"></div><input class="sim-search" id="contactSearch" placeholder="搜索姓名或号码"><div class="sim-list" id="contactList">${contacts.map((p,i)=>contactRow(p,i)).join('')}</div>`,'');return;
 }
 if(name==='photos'){
  const photos=saved.photos||[];c.innerHTML=wrap(`<div class="sim-toolbar"><span>所有照片</span><span class="photo-count">${photos.length} 张照片</span></div><div class="photo-grid">${photos.map((p,i)=>`<button class="photo-tile" data-action="open-photo" data-index="${i}" aria-label="查看照片"><img src="${esc(p.data)}" alt="照片 ${i+1}"></button>`).join('')}</div>${photos.length?'':emptyState('🌄','还没有照片','用相机拍下喜欢的瞬间')}`,'回忆都在这里');return;
 }
 if(name==='voice'){
  const recs=saved.recordings||[];c.innerHTML=wrap(`<div class="voice-card"><div class="voice-orb">🎙️</div><h2 id="recordStatus">准备录音</h2><p>录音需要浏览器授权麦克风；若当前网页不支持，会提示原因。</p><div class="voice-controls">${actionButton('● 开始录音','record-start')}${actionButton('■ 停止','record-stop','secondary')}</div></div><div class="sim-list">${recs.map((r,i)=>`<div class="sim-list-row"><span class="sim-row-icon">🔊</span><span><b>${esc(r.name)}</b><small>${esc(r.date)}</small><audio controls src="${r.data}"></audio></span><button data-action="delete-recording" data-index="${i}">删除</button></div>`).join('')}</div>`,'轻轻一点，记录声音');return;
 }
 if(name==='camera'){
  c.innerHTML=wrap(`<div class="camera-stage"><div class="camera-preview" id="cameraPreview">📷<p>准备拍摄</p><small>记录此刻</small></div><label class="shutter"><input type="file" id="cameraUpload" accept="image/*" capture="environment" hidden>●</label><p class="sim-muted">电脑端选择图片；手机浏览器可能会打开相机。</p></div>`,'相机');return;
 }
 if(name==='settings'){
  const defaults=[['飞行模式','airplane',false],['无线局域网','wifi',true],['蓝牙','bluetooth',true],['深色模式','dark',false],['显示电量百分比','battery',true]];
  c.innerHTML=wrap(`<div class="settings-profile"><div class="profile-avatar">👤</div><div><b>我的 iPhone</b><p>我的设备</p></div></div><div class="sim-list">${defaults.map(([label,key,def])=>`<label class="setting-row"><span>${label}</span><input type="checkbox" data-setting="${key}" ${((saved.settings||{})[key]??def)?'checked':''}></label>`).join('')}</div><div class="sim-list">${actionButton('更换锁屏壁纸','change-lock')}${actionButton('更换桌面壁纸','change-home')}${actionButton('重置本地模拟数据','reset-data','danger')}</div><p class="sim-muted">设置仅影响此网页模拟器，不会修改真实 iPhone 系统。</p>`,'设置');return;
 }
 if(name==='calendar'){
  const d=new Date();c.innerHTML=wrap(`<div class="calendar-hero"><div>${d.getFullYear()}年 ${d.getMonth()+1}月</div><strong>${d.getDate()}</strong><span>${['星期日','星期一','星期二','星期三','星期四','星期五','星期六'][d.getDay()]}</span></div><div class="sim-card"><h3>日程安排</h3><p>今天暂时没有日程。给自己留一点自由时间吧。</p>${actionButton('＋ 添加日程','add-event')}</div><div id="eventList">${(saved.events||[]).map((e,i)=>`<div class="sim-list-row"><span>📅</span><span><b>${esc(e.title)}</b><small>${esc(e.date)}</small></span><button data-action="delete-event" data-index="${i}">删除</button></div>`).join('')}</div>`,'日程安排');return;
 }
 if(name==='phone'){
  if(!Array.isArray(saved.calls)){saved.calls=(saved.contacts||[]).slice(0,5).map((p,i)=>({name:p.name,number:p.phone,type:i===2?'未接来电':'呼入',time:['今天 21:18','今天 18:42','昨天 19:45','昨天 16:20','周一'][i]}));}
  // Stable IDs prevent stale list positions from targeting a different call after insertion.
  const usedCallIds=new Set();
  (saved.calls||[]).forEach(call=>{if(!call.id||usedCallIds.has(call.id))call.id=createCallId();usedCallIds.add(call.id)});
  persist();
  const tab=saved.phoneTab||'recent', calls=saved.calls||[], contacts=saved.contacts||[];
  const tabs=[['favorites','☆','个人收藏'],['recent','◷','最近通话'],['contacts','♙','通讯录'],['keypad','▦','拨号键盘'],['voicemail','▣','语音留言']];
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
  if(tab==='keypad') body=`<div class="phone-keypad-wrap"><div class="phone-number-field"><input id="dialNumber" type="tel" inputmode="tel" autocomplete="tel" placeholder="输入电话号码" aria-label="电话号码" value="${esc(saved.phoneDialNumber||'')}"><button type="button" data-action="phone-backspace" aria-label="删除号码">⌫</button></div><div class="phone-keypad">${[['1',''],['2','ABC'],['3','DEF'],['4','GHI'],['5','JKL'],['6','MNO'],['7','PQRS'],['8','TUV'],['9','WXYZ'],['*',''],['0','+'],['#','']].map(([n,l])=>`<button data-action="phone-key" data-key="${n}"><b>${n}</b><small>${l}</small></button>`).join('')}</div><button class="phone-call-button" data-action="dial-call" aria-label="呼叫">☎</button></div>`;
  if(tab==='voicemail') body=`<div class="phone-page-heading"><h2>语音留言</h2><button class="phone-edit">编辑</button></div><div class="phone-voicemail-empty"><div>▣</div><b>没有语音留言</b><p>收到的语音留言会显示在这里。</p></div>`;
  c.innerHTML=`<div class="sim-app phone-app"><main class="phone-tab-content">${body}</main><nav class="phone-tabbar">${tabs.map(([k,ico,label])=>`<button class="${tab===k?'active':''}" data-action="phone-tab" data-tab="${k}"><span>${ico}</span><small>${label}</small></button>`).join('')}</nav></div>`;return;
 }
 if(name==='messages'||name==='mail'||name==='kakaotalk'||name==='wechat'){
  if(name==='wechat'||name==='kakaotalk'){renderSocialLanding(name,saved[name+'Tab']||'chats');return}
  const isMail=name==='mail',label=isMail?'收件箱':'信息',items=saved[name]||[];
  const rows=items.map(m=>{const thread=Array.isArray(m.thread)?m.thread:[],latest=thread[thread.length-1];return '<button class="sim-list-row message-row" data-action="open-chat" data-person="'+esc(m.to||'新对话')+'">'+avatarMarkup(m.to||'聊')+'<span class="message-row-copy"><b>'+esc(m.to||'新对话')+'</b><small>'+esc(latest?.text||m.body||'点击进入聊天')+'</small></span><span class="message-row-meta"><small class="message-time">'+esc(latest?.date||m.date||'刚刚')+'</small></span></button>'}).join('');
  c.innerHTML=wrap('<div class="message-heading"><b>'+label+'</b>'+actionButton(isMail?'＋ 写邮件':'＋ 新信息','new-message')+'</div><div id="messageEditor"></div><div class="sim-list message-list">'+(rows||emptyState('💬','还没有对话','点击右上角按钮，创建一条模拟聊天'))+'</div>','');return;
 }
 if(name==='instagram'){
  const posts=saved.posts_instagram||[];
  c.innerHTML=wrap(`<div class="ig-topbar"><strong>Instagram</strong><div><button aria-label="通知">♡</button><button aria-label="私信">➤</button></div></div><div class="ig-stories"><div class="ig-story"><span class="ig-story-avatar own">＋</span><small>你的动态</small></div>${[['智敏','🌙'],['朋友','🌤️']].map(([n,em])=>`<div class="ig-story"><span class="ig-story-avatar">${em}</span><small>${n}</small></div>`).join('')}</div><div id="postEditor"></div><div class="ig-feed">${posts.map((p,i)=>`<article class="ig-post"><div class="ig-post-head"><span class="ig-avatar">${i%2?'🌙':'📷'}</span><div><b>${i%2?'slow.days':'daily.moments'}</b><small>${i%2?'城市散步':'日常记录'}</small></div><button class="ig-more" aria-label="更多">•••</button></div>${p.image?`<img class="ig-post-image" src="${esc(p.image)}" alt="动态照片" data-action="open-post-image" data-index="${i}">`:`<div class="ig-post-art ig-art-${i%3}"><span>${i%2?'☁️':'🌿'}</span><b>${esc(p.title||'最近的日常')}</b><small>${esc(p.body)}</small></div>`}<div class="ig-post-actions"><button data-action="like-post" data-index="${i}">♡</button><button aria-label="评论">▢</button><button aria-label="分享">➤</button><button class="ig-bookmark" aria-label="收藏">♧</button></div><b class="ig-likes">${p.likes||24} 次赞</b><p class="ig-caption"><b>${i%2?'slow.days':'daily.moments'}</b> ${esc(p.body)}</p><small class="ig-comments">查看全部评论 · 昨天</small></article>`).join('')}</div><div class="ig-bottom"><span>⌂</span><span>⌕</span><button data-action="new-post">＋</button><span>♡</span><span>◉</span></div>`,'');return;
 }
 if(name==='x'){
  const posts=saved.posts_x||[];const tab=saved.xTab||'for-you';const section=saved.xSection||'home';
  const tabs=[['for-you','为你推荐'],['following','正在关注']];
  const feed=posts.map((p,i)=>`<article class="x-post"><div class="x-avatar">${i%2?'☁':'雨'}</div><div class="x-post-main"><div class="x-post-meta"><b>${i%2?'慢慢来':'momo'}</b><span>@${i%2?'slowly_today':'momo_daily'} · ${i?'3小时':'1小时'}</span><button aria-label="更多">•••</button></div><p>${esc(p.body||p.title)}</p>${p.image?`<img class="x-post-image" src="${esc(p.image)}" alt="帖子图片" data-action="open-post-image" data-index="${i}">`:''}<div class="x-post-stats"><button data-action="x-reply" data-index="${i}">▢ <span>${i?3:2}</span></button><button data-action="x-repost" data-index="${i}">🔁 <span>${i?5:8}</span></button><button data-action="like-post" data-index="${i}">♡ <span>${p.likes||8}</span></button><button>▤ <span>${i?'126':'248'}</span></button><button>↥</button></div></div></article>`).join('');
  let sectionBody='';
  if(section==='home') sectionBody=`<div class="x-tabs">${tabs.map(([k,t])=>`<button class="${tab===k?'active':''}" data-action="x-tab" data-tab="${k}">${t}</button>`).join('')}</div><div class="x-compose"><div class="x-avatar">m</div><div class="x-compose-body"><textarea id="xQuickPost" rows="2" placeholder="有什么新鲜事？"></textarea><div class="x-compose-actions"><span>◎　▧　☷</span><button data-action="publish-x-quick">发帖</button></div></div></div><div class="x-feed">${feed||emptyState('𝕏','暂时没有帖子','发布一条动态开始分享')}</div>`;
  else if(section==='search') sectionBody=`<div class="x-section-page"><h2>搜索</h2><input class="x-search-input" placeholder="搜索 X"><h3>发生了什么</h3><p>探索热门话题、账号和最新动态</p><div class="x-trend"><small>日本 · 趋势</small><b># 今日の話題</b><small>正在讨论 · 更多帖子</small></div><div class="x-trend"><small>娱乐 · 趋势</small><b>韩国流行音乐</b><small>热门讨论</small></div></div>`;
  else if(section==='communities') sectionBody=`<div class="x-section-page"><h2>社群</h2><p>加入感兴趣的社群，和大家交流。</p><div class="x-trend"><b>摄影与日常</b><small>分享照片、灵感和生活碎片</small></div><div class="x-trend"><b>K-POP 讨论区</b><small>聊聊喜欢的音乐和舞台</small></div></div>`;
  else if(section==='notifications') sectionBody=`<div class="x-section-page"><h2>通知</h2><div class="x-notice"><b>欢迎来到 X</b><p>点赞、回复和关注动态会显示在这里。</p></div></div>`;
  else sectionBody=`<div class="x-section-page x-profile-page"><div class="x-cover"></div><div class="x-profile-avatar">雨</div><h2>momo</h2><p>@momo_daily</p><p>记录日常、照片和喜欢的事。</p><div class="x-profile-stats"><b>0 <small>正在关注</small></b><b>0 <small>关注者</small></b></div><button class="x-edit-profile">编辑个人资料</button><div class="x-tabs"><button class="active">帖子</button><button>回复</button><button>媒体</button></div>${feed}</div>`;
  const nav=[['home','⌂','首页'],['search','⌕','搜索'],['communities','◎','社群'],['notifications','♡','通知'],['profile','♙','个人资料']];
  c.innerHTML=wrap(`<div class="x-shell"><div class="x-topbar"><strong>𝕏</strong><button class="x-premium">升级 Premium</button></div><div class="x-content">${sectionBody}</div><div class="x-bottom">${nav.map(([k,ico,t])=>`<button class="${section===k?'active':''}" aria-label="${t}" data-action="x-section" data-section="${k}">${ico}</button>`).join('')}</div></div>`,'');return;
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
  c.innerHTML=wrap(`<form class="browser-form" id="browserForm"><span>🔍</span><input id="browserUrl" placeholder="输入网址或搜索内容" value="https://www.apple.com"><button>前往</button></form><div class="browser-shortcuts">${[['Apple','https://www.apple.com'],['Bing','https://www.bing.com'],['GitHub','https://github.com']].map(x=>`<button data-url="${x[1]}"><span>🌐</span>${x[0]}</button>`).join('')}</div><div class="browser-note">网页将在独立浏览器标签页打开。<p>为了安全和兼容性，模拟器不直接把外部网页嵌入手机内。</p></div>`,'搜索或输入网址');return;
 }
 if(name==='camera')return;
 c.innerHTML=wrap(`<div class="sim-app-hero">${icons[name]||'📱'}</div><h2>${appNames[name]||name}</h2><p class="sim-muted">欢迎使用${appNames[name]||name}。</p><div class="sim-card"><h3>功能说明</h3><p>浏览并使用这里的功能。</p>${actionButton('返回桌面','go-home')}</div>`,'欢迎使用');
}
function openPhotoViewer(src,index=0){let viewer=$('#photoViewer');if(!viewer){viewer=document.createElement('div');viewer.id='photoViewer';viewer.className='photo-viewer';viewer.innerHTML='<button class="photo-viewer-close" aria-label="返回">‹</button><span class="photo-viewer-index"></span><img alt="照片大图">';$('.phone-frame').appendChild(viewer);viewer.addEventListener('click',e=>{if(e.target===viewer||e.target.closest('.photo-viewer-close'))viewer.classList.remove('open')})}viewer.querySelector('img').src=src;viewer.querySelector('.photo-viewer-index').textContent=String(index+1);viewer.classList.add('open')}
function contactRow(p,i){return `<div class="sim-list-row">${avatarMarkup(p.name)}<span><b>${esc(p.name)}</b><small>${esc(p.phone)}</small><small>${esc(p.note||'')}</small></span></div>`}
function editorNote(index=null){const n=index===null?{title:'',body:''}:saved.notes[index];$('#noteEditor').innerHTML=`<div class="editor-card">${field('标题','noteTitle',n.title,'新备忘录')}<label class="sim-field">内容<textarea id="noteBody" rows="4" placeholder="开始输入...">${esc(n.body)}</textarea></label>${actionButton('保存','save-note')}${actionButton('取消','cancel-editor','secondary')}<input type="hidden" id="noteIndex" value="${index===null?'':index}"></div>`}
function renderEditor(id,html){const el=$('#'+id);if(el)el.innerHTML=html}
function createCallId(){return 'call-'+Date.now().toString(36)+'-'+Math.random().toString(36).slice(2,9)}
let phoneCallTimer=null;
function finishPhoneCall(){if(phoneCallTimer){clearTimeout(phoneCallTimer);phoneCallTimer=null}document.querySelector('.phone-call-overlay')?.remove()}
function startPhoneCall(number,name){if(!number)return;finishPhoneCall();saved.calls=saved.calls||[];saved.calls.unshift({id:createCallId(),name:name||number,number,type:'呼出',time:new Date().toLocaleString()});persist();const host=document.querySelector('.phone-app');if(!host)return;const overlay=document.createElement('div');overlay.className='phone-call-overlay';overlay.innerHTML=`<div class="phone-call-info"><div class="phone-call-avatar">${avatarMarkup(name||number,'phone-call-photo')}</div><strong>${esc(name||number)}</strong><span>${esc(number)}</span><small class="phone-call-status">正在呼叫…</small></div><button type="button" class="phone-hangup" data-action="phone-call-end" aria-label="挂断">☎</button>`;host.append(overlay);phoneCallTimer=setTimeout(finishPhoneCall,4500)}
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
  if(act==='social-contact-call'){toast('语音通话为界面演示，暂不连接真实通话');return}
  if(act==='message-copy'||act==='message-recall'||act==='message-delete'){
   const row=e.target.closest('.chat-message-actions'),idx=Number(row?.dataset.messageIndex),item=(saved[currentApp]||[]).find(x=>x.to===activeChat),msg=item?.thread?.[idx];
   if(!msg)return;
   if(act==='message-copy'){const value=msg.text||'';if(navigator.clipboard?.writeText)navigator.clipboard.writeText(value).then(()=>toast('已复制消息')).catch(()=>toast('复制失败，请检查浏览器权限'));else{const ta=document.createElement('textarea');ta.value=value;document.body.append(ta);ta.select();document.execCommand('copy');ta.remove();toast('已复制消息')}}
   if(act==='message-recall'){if(msg.from!=='me'){toast('只能撤回自己发送的消息');return}msg.recalled=true;msg.text='';item.body='你撤回了一条消息';persist();renderChatThread(currentApp,activeChat);toast('已撤回消息')}
   if(act==='message-delete'){item.thread.splice(idx,1);const latest=item.thread[item.thread.length-1];item.body=latest?.text||'';item.date=latest?.date||'刚刚';persist();renderChatThread(currentApp,activeChat);toast('已删除消息')}
   return;
  }
  if(act==='message-menu-close'){$('#chatActionHost')?.replaceChildren();return}
  if(act==='open-chat'){const person=e.target.closest('[data-person]')?.dataset.person;if(person)renderChatThread(currentApp,person);return}
  if(act==='chat-back'){activeChat=null;renderApp(currentApp);return}
  if(act==='open-chat-settings'){renderSocialChatSettings(currentApp,activeChat||'');return}
  if(act==='send-chat'){const input=$('#chatInput'),text=input?.value.trim();if(!text||!activeChat)return;const item=(saved[currentApp]||[]).find(x=>x.to===activeChat);if(!item)return;item.thread=item.thread||[];item.thread.push({from:'me',text,date:new Date().toLocaleTimeString([], {hour:'2-digit',minute:'2-digit'})});item.body=text;item.date='刚刚';persist();if(currentApp==='kakaotalk')updateLockKakaoNotification();renderChatThread(currentApp,activeChat);return}
  if(act==='x-tab'){saved.xTab=e.target.closest('[data-tab]')?.dataset.tab||'for-you';saved.xSection='home';persist();renderApp('x');return}
  if(act==='x-section'){saved.xSection=e.target.closest('[data-section]')?.dataset.section||'home';persist();renderApp('x');return}
  if(act==='x-reply'||act==='x-repost'){toast(act==='x-reply'?'回复功能已打开（演示）':'已模拟转发');return}
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
  if(act==='publish-x-quick'){const body=$('#xQuickPost')?.value.trim();if(!body){toast('先写点内容再发帖');return}saved.posts_x=saved.posts_x||[];saved.posts_x.unshift({title:'',body,image:'',likes:0});persist();renderApp('x');toast('已发布')}
  if(act==='delete-recording'){saved.recordings.splice(index,1);persist();renderApp('voice')}
  if(act==='new-message'){const mail=currentApp==='mail';renderEditor('messageEditor',`<div class="editor-card">${field(mail?'收件人':'联系人','msgTo','','输入姓名')}${mail?field('主题','msgSubject','','邮件主题'):''}<label class="sim-field">内容<textarea id="msgBody" rows="3" placeholder="输入内容..."></textarea></label>${actionButton('保存到模拟收件箱','save-message')}${actionButton('取消','cancel-message','secondary')}</div>`)}
  if(act==='cancel-message')renderEditor('messageEditor','');
  if(act==='save-message'){const to=$('#msgTo').value.trim()||'新对话',body=$('#msgBody').value.trim();if(!body){toast('请输入内容');return}saved[currentApp]=saved[currentApp]||[];saved[currentApp].unshift({to,body,date:new Date().toLocaleString()});persist();renderApp(currentApp);toast('已保存')}
  if(act==='delete-message'){saved[currentApp].splice(index,1);persist();renderApp(currentApp)}
  if(act==='new-post')renderEditor('postEditor',`<div class="editor-card">${field('标题','postTitle','','给这条动态起个标题')}<label class="sim-field">内容<textarea id="postBody" rows="4" placeholder="分享你的生活..."></textarea></label><label class="sim-field">添加图片（选填）<input type="file" id="postImage" accept="image/*"></label>${actionButton('发布','publish-post')}${actionButton('取消','cancel-post','secondary')}</div>`);
  if(act==='cancel-post')renderEditor('postEditor','');
  if(act==='publish-post'){const body=$('#postBody').value.trim(),title=$('#postTitle').value.trim();if(!body&&!title){toast('写点内容再发布吧');return}const file=$('#postImage').files[0];const publish=data=>{const key='posts_'+currentApp;saved[key]=saved[key]||[];saved[key].unshift({title,body,image:data||'',likes:0});persist();renderApp(currentApp);toast('动态已发布到本地')};if(file){const r=new FileReader();r.onload=()=>publish(r.result);r.readAsDataURL(file)}else publish('')}
  if(act==='like-post'){const arr=saved['posts_'+currentApp];arr[index].likes=(arr[index].likes||0)+1;persist();renderApp(currentApp)}
  if(act==='delete-post'){saved['posts_'+currentApp].splice(index,1);persist();renderApp(currentApp)}
  if(act==='go-home'){closeApp()}
  if(act==='change-lock'||act==='change-home'){const input=document.createElement('input');input.type='file';input.accept='image/*';input.onchange=()=>{const f=input.files[0];if(!f)return;const r=new FileReader();r.onload=()=>{const bg=act==='change-lock'?'.lock-bg':'.home-bg';$(bg).style.backgroundImage=`url("${r.result}")`;try{localStorage.setItem('ryryry-'+act,r.result)}catch(e){toast('图片太大，已临时更换但无法持久保存')}};r.readAsDataURL(f)};input.click()}
  if(act==='reset-data'){if(confirm('确定清除模拟器保存的备忘录、联系人、动态和设置吗？')){localStorage.removeItem(STORE);Object.keys(saved).forEach(k=>delete saved[k]);renderApp('settings');toast('本地模拟数据已重置')}}
  if(act==='add-event'){renderEditor('eventList',`<div class="editor-card">${field('日程名称','eventTitle','','输入日程')}<input id="eventDate" type="datetime-local">${actionButton('保存日程','save-event')}${actionButton('取消','cancel-event','secondary')}</div>`)}
  if(act==='save-event'){const title=$('#eventTitle').value.trim(),date=$('#eventDate').value;if(!title){toast('请输入日程名称');return}saved.events=saved.events||[];saved.events.push({title,date:date||'未设置时间'});persist();renderApp('calendar')}
  if(act==='cancel-event')renderApp('calendar');
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
  if(act==='call-contact'){const p=(saved.calls||[])[index];if(p){const d=$('#dialNumber');if(d){d.value=p.number||'';d.focus();d.setSelectionRange(d.value.length,d.value.length)}}}
  if(act==='record-start')startRecording();
  if(act==='record-stop')stopRecording();
 }
 const shortcut=e.target.closest('[data-url]');if(shortcut)window.open(shortcut.dataset.url,'_blank','noopener');
});
let chatPressTimer=null;
appContent.addEventListener('pointerdown',e=>{const line=e.target.closest('.chat-line[data-message-index]');if(!line)return;clearTimeout(chatPressTimer);chatPressTimer=setTimeout(()=>{const host=$('#chatActionHost');if(!host)return;const idx=Number(line.dataset.messageIndex),msg=(saved[currentApp]||[]).find(x=>x.to===activeChat)?.thread?.[idx];if(!msg)return;host.innerHTML='<div class="chat-message-actions" data-message-index="'+idx+'"><button data-action="message-copy">复制</button>'+(msg.from==='me'&&!msg.recalled?'<button data-action="message-recall">撤回</button>':'')+'<button data-action="message-delete">删除</button><button data-action="message-menu-close">取消</button></div>';},520)});
appContent.addEventListener('pointerup',()=>clearTimeout(chatPressTimer));
appContent.addEventListener('pointercancel',()=>clearTimeout(chatPressTimer));
appContent.addEventListener('contextmenu',e=>{const line=e.target.closest('.chat-line[data-message-index]');if(!line)return;e.preventDefault();clearTimeout(chatPressTimer);const host=$('#chatActionHost'),idx=Number(line.dataset.messageIndex),msg=(saved[currentApp]||[]).find(x=>x.to===activeChat)?.thread?.[idx];if(!host||!msg)return;host.innerHTML='<div class="chat-message-actions" data-message-index="'+idx+'"><button data-action="message-copy">复制</button>'+(msg.from==='me'&&!msg.recalled?'<button data-action="message-recall">撤回</button>':'')+'<button data-action="message-delete">删除</button><button data-action="message-menu-close">取消</button></div>';});
appContent.addEventListener('keydown',e=>{if(e.target.id==='chatInput'&&e.key==='Enter'){e.preventDefault();const b=appContent.querySelector('[data-action="send-chat"]');b?.click()}});
appContent.addEventListener('change',e=>{
 if(e.target.matches('[data-chat-setting]')){const person=e.target.dataset.person;let item=(saved[currentApp]||[]).find(x=>x.to===person);if(!item){item={to:person,thread:[]};saved[currentApp].push(item)}if(e.target.dataset.chatSetting==='mute')item.muted=e.target.checked;if(e.target.dataset.chatSetting==='pinned')item.pinned=e.target.checked;if(e.target.dataset.chatSetting==='saved')item.savedContact=e.target.checked;persist();toast('聊天设置已保存')}
 if(e.target.matches('[data-setting]')){saved.settings=saved.settings||{};saved.settings[e.target.dataset.setting]=e.target.checked;persist();document.body.classList.toggle('sim-dark',!!saved.settings.dark);toast('设置已保存')}
 if(e.target.id==='cameraUpload'){const files=[...e.target.files];files.forEach(file=>{const reader=new FileReader();reader.onload=()=>{$('#cameraPreview').innerHTML=`<img class="camera-result" src="${reader.result}"><p>已拍摄并保存</p>`;saved.photos=saved.photos||[];saved.photos.unshift({data:reader.result});persist();toast('照片已保存到相册')};reader.readAsDataURL(file)})}
});
appContent.addEventListener('submit',e=>{
 if(e.target&&e.target.id==='xhsSearchForm'){
  e.preventDefault();const q=($('#xhsSearchInput')?.value||'').trim();if(!q){toast('请输入搜索内容');return}
  saved.xhsQuery=q;saved.xhsSearchHistory=[q,...(saved.xhsSearchHistory||[]).filter(x=>x!==q)].slice(0,12);saved.xhsTab='search-results';persist();renderApp('xiaohongshu');
 }
});
appContent.addEventListener('input',e=>{
 if(e.target.id==='contactSearch'){const q=e.target.value.toLowerCase();$('#contactList .sim-list-row').forEach(row=>row.style.display=row.textContent.toLowerCase().includes(q)?'':'none')}
 if(e.target.id==='chatListSearch'){const q=e.target.value.trim().toLowerCase();$('.social-message-list .message-row').forEach(row=>row.style.display=row.textContent.toLowerCase().includes(q)?'':'none')}
 if(e.target.id==='socialContactSearch'){const q=e.target.value.trim().toLowerCase();$('.social-list .social-row').forEach(row=>row.style.display=row.textContent.toLowerCase().includes(q)?'':'none')}
});
let mediaRecorder=null,recordChunks=[];
async function startRecording(){try{if(!navigator.mediaDevices?.getUserMedia)throw new Error('浏览器不支持麦克风录音');const stream=await navigator.mediaDevices.getUserMedia({audio:true});recordChunks=[];mediaRecorder=new MediaRecorder(stream);mediaRecorder.ondataavailable=e=>{if(e.data.size)recordChunks.push(e.data)};mediaRecorder.onstop=()=>{const blob=new Blob(recordChunks,{type:mediaRecorder.mimeType||'audio/webm'});const reader=new FileReader();reader.onload=()=>{saved.recordings=saved.recordings||[];saved.recordings.unshift({name:'录音 '+new Date().toLocaleTimeString(),date:new Date().toLocaleString(),data:reader.result});persist();if(currentApp==='voice')renderApp('voice');toast('录音已保存')};reader.readAsDataURL(blob);stream.getTracks().forEach(t=>t.stop())};mediaRecorder.start();$('#recordStatus').textContent='正在录音…';toast('录音开始')}catch(err){toast('无法录音：请使用 HTTPS 并允许麦克风权限')}}
function stopRecording(){if(mediaRecorder&&mediaRecorder.state!=='inactive'){mediaRecorder.stop();$('#recordStatus').textContent='录音已停止'}else toast('当前没有正在进行的录音')}
appContent.addEventListener('submit',e=>{if(e.target.id==='browserForm'){e.preventDefault();let url=$('#browserUrl').value.trim();if(!url)return;if(!/^https?:\/\//i.test(url)){url=/\./.test(url)&&!/\s/.test(url)?'https://'+url:'https://www.google.com/search?q='+encodeURIComponent(url)}window.open(url,'_blank','noopener');}});
function updateClock(){const now=new Date(),time=now.toLocaleTimeString('zh-CN',{hour:'2-digit',minute:'2-digit',hour12:false}),month=now.getMonth()+1,day=now.getDate(),week=['星期日','星期一','星期二','星期三','星期四','星期五','星期六'][now.getDay()],dateStr=`${month}月${day}日 ${week}`;['lockTime','lockStatusTime','statusTime'].forEach(id=>{const el=$('#'+id);if(el)el.textContent=time});if($('#lockDateTop'))$('#lockDateTop').textContent=dateStr;if($('#widgetCalDay'))$('#widgetCalDay').textContent=day;if($('#widgetCalWeek'))$('#widgetCalWeek').textContent=week;if($('#widgetCalMonth'))$('#widgetCalMonth').textContent=`${month}月`}
updateClock();setInterval(updateClock,1000);
try{const lock=localStorage.getItem('ryryry-change-lock'),home=localStorage.getItem('ryryry-change-home');if(lock) $('.lock-bg').style.backgroundImage=`url("${lock}")`;if(home) $('.home-bg').style.backgroundImage=`url("${home}")`;document.body.classList.toggle('sim-dark',!!saved.settings?.dark)}catch(e){}
