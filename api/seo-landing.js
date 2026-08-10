const {readPublicCars}=require('../lib/publicCatalog');

const esc=s=>String(s??'').replace(/[&<>"']/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#039;'}[m]));
const money=v=>'$'+Number(v||0).toLocaleString('en-US');

const pages={
  'avto-bez-pershoho-vnesku':{
    title:'Авто без першого внеску в Україні | SoloDealer',
    desc:'Шукаєте авто без першого внеску? SoloDealer допоможе перевірити доступні варіанти фінансування або виплати. Онлайн-заявка та підбір авто по Україні.',
    h1:'Купити авто <span class="grad">без першого внеску</span>: які варіанти є',
    lead:'Нульовий перший внесок доступний не для кожного автомобіля і не в кожній програмі. Залиште заявку — перевіримо, чи є варіант без стартового платежу або запропонуємо мінімально можливий внесок.',
    tiles:[['Без обіцянок наперед','Наявність програми з 0% першого внеску підтверджується лише після розгляду заявки.'],['Підбір під бюджет','Якщо 0% недоступно, шукаємо варіант із найменшим стартовим платежем.'],['Вся Україна','Заявку можна подати онлайн, незалежно від міста.']],
    section:'Автомобілі, які можна розглянути',
    sectionText:'Покажемо актуальні авто з каталогу. Конкретний розмір першого внеску залежить від автомобіля та програми фінансування.',
    faq:[['Чи реально купити машину без першого внеску?','Такі програми інколи доступні, але не для кожного авто та клієнта. Потрібен індивідуальний розгляд.'],['Що робити, якщо 0% не погоджують?','Ми можемо підібрати авто з мінімальним першим внеском і комфортним щомісячним платежем.'],['Чи є гарантія схвалення?','Ні. Рішення залежить від обраної програми, документів та результату перевірки.']],
    src:'seo-zero-down',
    pick:cars=>cars.slice().sort((a,b)=>(a.first_payment??999999)-(b.first_payment??999999)).slice(0,9)
  },
  'avto-z-minimalnym-pershym-vneskom':{
    title:'Авто з мінімальним першим внеском | SoloDealer',
    desc:'Авто з мінімальним першим внеском в Україні. Порівняйте актуальні пропозиції SoloDealer та залиште заявку на підбір під ваш бюджет.',
    h1:'Авто з <span class="grad">мінімальним першим внеском</span>',
    lead:'Якщо головне — сісти за кермо з мінімальною стартовою сумою, ми можемо орієнтувати підбір саме на перший внесок, а не лише на повну ціну автомобіля.',
    tiles:[['Пріоритет — стартова сума','Показуємо пропозиції з найменшим зазначеним внеском першими.'],['Платіж під ваш бюджет','У заявці можна вказати бажану суму на місяць.'],['Кредит або виплата','Формат залежить від конкретної пропозиції та результату розгляду.']],
    section:'Пропозиції з найменшим внеском',
    sectionText:'Нижче автомобілі відсортовані за зазначеним першим внеском. Якщо внесок у картці не вказаний, фінальні умови уточнюються окремо.',
    faq:[['Який мінімальний перший внесок?','Він різний для кожного авто та програми. У каталозі для частини машин вказаний орієнтовний стартовий внесок.'],['Можна вказати свій бюджет на перший внесок?','Так. У заявці напишіть суму, яку готові внести на старті, і комфортний платіж на місяць.'],['Чи можна достроково закрити фінансування?','Це залежить від конкретної програми. Умови дострокового погашення уточнюються перед оформленням.']],
    src:'seo-min-down',
    pick:cars=>cars.slice().sort((a,b)=>(a.first_payment??999999)-(b.first_payment??999999)).slice(0,9)
  },
  'avto-pry-neidealnii-kredytnii-istorii':{
    title:'Авто при поганій кредитній історії — подати заявку | SoloDealer',
    desc:'Потрібне авто, але кредитна історія неідеальна? Подайте заявку в SoloDealer — перевіримо доступні варіанти фінансування або виплати без гарантії схвалення.',
    h1:'Авто при <span class="grad">неідеальній кредитній історії</span>',
    lead:'Стара прострочка або слабка кредитна історія не означає, що не варто подавати заявку. Ми не обіцяємо автоматичного схвалення, але можемо перевірити доступні варіанти та підібрати формат під вашу ситуацію.',
    tiles:[['Індивідуальний розгляд','Кожна заявка оцінюється окремо — без обіцянки схвалення наперед.'],['Можливі альтернативи','Якщо стандартний кредит не підходить, уточнюємо інші доступні формати.'],['Без приховування умов','Фінальний внесок, строк та платіж погоджуються до оформлення.']],
    section:'Авто для подачі заявки',
    sectionText:'Виберіть автомобіль або просто залиште заявку на підбір. Кредитна історія не змінює каталог — вона впливає лише на доступні умови фінансування.',
    faq:[['Чи можна отримати авто з поганою кредитною історією?','Іноді так, але рішення залежить від конкретної програми та перевірки. Гарантувати схвалення неможливо.'],['Чи потрібно приховувати старі прострочки?','Ні. Краще вказати ситуацію коректно, щоб одразу оцінювати реальні варіанти.'],['Що може допомогти отримати кращі умови?','Більший перший внесок, підтверджений дохід або вибір доступнішого автомобіля можуть розширити варіанти, але це залежить від програми.']],
    src:'seo-credit-history',
    pick:cars=>cars.slice().sort((a,b)=>a.price-b.price).slice(0,9)
  },
  'avto-pid-vyplatu-dlia-taksi':{
    title:'Авто під виплату для таксі в Україні | SoloDealer',
    desc:'Авто під виплату для роботи в таксі: економні седани, газ, гібрид та електро. SoloDealer — підбір авто під бюджет і щомісячний платіж.',
    h1:'Авто під виплату <span class="grad">для роботи в таксі</span>',
    lead:'Для таксі важлива не тільки ціна авто, а й витрати на паливо, надійність та щомісячний платіж. Підберемо варіант, який можна розглядати для роботи в сервісах таксі або доставки.',
    tiles:[['Економні силові установки','У пріоритеті газ, гібрид та електро — залежно від вашого міста й пробігів.'],['Під платіж на місяць','Можна одразу вказати суму, яку авто має відпрацьовувати щомісяця.'],['Під ваш сервіс','У заявці напишіть, де плануєте працювати: Uklon, Bolt, Uber, доставка тощо.']],
    section:'Авто, які варто розглянути для роботи',
    sectionText:'Це не гарантія допуску конкретної моделі до певного тарифу таксі. Перед оформленням перевірте актуальні вимоги сервісу у вашому місті.',
    faq:[['Яке авто краще для таксі під виплату?','Зазвичай вигідні моделі з невисокою витратою пального, доступним сервісом і платежем, який відповідає вашому реальному пробігу.'],['Чи можна працювати в Uklon, Bolt або Uber?','Залежить від року, моделі, стану авто та правил конкретного сервісу у вашому місті.'],['Що вказати в заявці?','Місто, сервіс таксі, бажаний клас, перший внесок, бюджет на місяць і приблизний денний пробіг.']],
    src:'seo-taxi',
    pick:cars=>cars.filter(c=>/газ|гібрид|hybrid|електро/i.test((c.fuel||'')+' '+(c.engine||''))).sort((a,b)=>a.price-b.price).slice(0,9)
  }
};

const style=`<style>:root{--bg:#050505;--panel:#0d0d10;--text:#f7f7f9;--muted:#9999a3;--line:#292932;--grad:linear-gradient(110deg,#8c42df,#bd5acd 48%,#ff8b90)}*{box-sizing:border-box}body{margin:0;background:radial-gradient(circle at 85% 0,rgba(140,66,223,.12),transparent 32%),var(--bg);color:var(--text);font-family:Arial,sans-serif}a{color:inherit;text-decoration:none}.wrap{width:min(1100px,calc(100% - 32px));margin:auto}header{border-bottom:1px solid #222;background:rgba(5,5,5,.92);position:sticky;top:0;z-index:10}nav{min-height:72px;display:flex;align-items:center;justify-content:space-between;gap:14px}.brand{font-size:20px;font-weight:900}.brand b,.grad,.more{background:var(--grad);-webkit-background-clip:text;color:transparent}.nav{display:flex;gap:9px;align-items:center;flex-wrap:wrap;justify-content:flex-end}.btn,.ghost{display:inline-block;padding:12px 17px;border-radius:13px;font-weight:850}.btn{background:var(--grad)}.ghost{border:1px solid #333;background:#111}.hero{padding:68px 0 38px}.eyebrow{text-transform:uppercase;letter-spacing:.12em;font-size:12px;color:#dab3f7;font-weight:900}.hero h1{font-size:clamp(42px,7vw,72px);line-height:1;margin:15px 0 20px;max-width:940px}.hero p,.text{color:#9d9da7;line-height:1.72}.hero p{font-size:18px;max-width:800px}.actions{display:flex;gap:10px;flex-wrap:wrap;margin-top:23px}.info{display:grid;grid-template-columns:repeat(3,1fr);gap:12px;margin-top:30px}.tile,.faq-item{border:1px solid var(--line);background:var(--panel);border-radius:18px;padding:18px}.tile b,.faq-item b{display:block;font-size:17px;margin-bottom:8px}.tile span,.faq-item span{color:#96969f;line-height:1.55;font-size:14px}section{padding:42px 0}.head h2{font-size:36px;margin:0 0 10px}.cars{display:grid;grid-template-columns:repeat(3,1fr);gap:16px;margin-top:22px}.card{border:1px solid var(--line);border-radius:20px;overflow:hidden;background:var(--panel)}.photo{height:220px;background:#111}.photo img{width:100%;height:100%;object-fit:cover}.body{padding:16px}.body h3{margin:0 0 8px;font-size:18px}.meta{color:#85858e;font-size:13px;line-height:1.5}.price{font-size:22px;font-weight:900;margin-top:14px}.first{color:#ffd1d7;font-weight:850;margin-top:8px}.more{display:inline-block;margin-top:12px;font-weight:800}.faq{display:grid;grid-template-columns:1fr 1fr;gap:12px}.related{display:flex;gap:9px;flex-wrap:wrap}.related a{border:1px solid #303038;border-radius:999px;padding:10px 13px;color:#c7c7ce}.cta{border:1px solid #44284c;border-radius:26px;padding:38px;text-align:center;background:#0d0a0f}.cta h2{font-size:36px;margin:0 0 12px}.cta p{color:#999;line-height:1.65;max-width:720px;margin:0 auto 20px}footer{border-top:1px solid #222;padding:26px 0;color:#777;font-size:13px}@media(max-width:850px){.info,.cars{grid-template-columns:1fr 1fr}}@media(max-width:620px){.nav .ghost{display:none}.info,.cars,.faq{grid-template-columns:1fr}.hero{padding-top:48px}.head h2{font-size:30px}.cta{padding:28px 20px}}</style>`;

function renderCards(cars){return cars.map(c=>`<article class="card"><div class="photo">${c.images?.[0]?`<img src="${esc(c.images[0])}" alt="${esc(c.name)}" loading="lazy">`:''}</div><div class="body"><h3>${esc(c.name)}</h3><div class="meta">${c.year||''} · ${esc(c.fuel||'')} · ${Number(c.mileage||0).toLocaleString('uk-UA')} км</div><div class="price">від ${money(c.price)}</div>${c.first_payment?`<div class="first">Перший внесок від ${money(c.first_payment)}</div>`:''}<a class="more" href="/auto/${encodeURIComponent(c.id)}">Детальніше →</a></div></article>`).join('')}

module.exports=async(req,res)=>{
  try{
    const slug=String(req.query.slug||'');
    const p=pages[slug];
    if(!p)return res.status(404).send('Not found');
    const all=(await readPublicCars()).filter(c=>c.published!==false);
    const cars=p.pick(all);
    const faqSchema={"@context":"https://schema.org","@type":"FAQPage","mainEntity":p.faq.map(([q,a])=>({"@type":"Question","name":q,"acceptedAnswer":{"@type":"Answer","text":a}}))};
    const tiles=p.tiles.map(([b,s])=>`<div class="tile"><b>${esc(b)}</b><span>${esc(s)}</span></div>`).join('');
    const faq=p.faq.map(([q,a])=>`<div class="faq-item"><b>${esc(q)}</b><span>${esc(a)}</span></div>`).join('');
    const related=`<div class="related"><a href="/avto-pid-vyplatu">Авто під виплату</a><a href="/avto-bez-pershoho-vnesku">Без першого внеску</a><a href="/avto-z-minimalnym-pershym-vneskom">Мінімальний внесок</a><a href="/avto-pry-neidealnii-kredytnii-istorii">Кредитна історія</a><a href="/avto-pid-vyplatu-dlia-taksi">Для таксі</a></div>`;
    const html=`<!doctype html><html lang="uk"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>${esc(p.title)}</title><meta name="description" content="${esc(p.desc)}"><meta name="robots" content="index,follow,max-image-preview:large"><link rel="canonical" href="https://solodealer.store/${slug}"><link rel="icon" href="/favicon.svg" type="image/svg+xml"><meta property="og:type" content="website"><meta property="og:site_name" content="SoloDealer"><meta property="og:title" content="${esc(p.title)}"><meta property="og:description" content="${esc(p.desc)}"><meta property="og:url" content="https://solodealer.store/${slug}"><script type="application/ld+json">${JSON.stringify(faqSchema).replace(/</g,'\\u003c')}</script>${style}</head><body><header><div class="wrap"><nav><a class="brand" href="/"><b>SOLO</b>Dealer</a><div class="nav"><a class="ghost" href="/avto-pid-vyplatu">Під виплату</a><a class="ghost" href="/avto-v-kredyt">Кредит</a><a class="btn" href="/anketa?src=${encodeURIComponent(p.src)}">Залишити заявку</a></div></nav></div></header><main><section class="hero"><div class="wrap"><div class="eyebrow">SoloDealer · Україна</div><h1>${p.h1}</h1><p>${esc(p.lead)}</p><div class="actions"><a class="btn" href="#cars">Дивитися авто</a><a class="ghost" href="/anketa?src=${encodeURIComponent(p.src)}">Заповнити анкету</a></div><div class="info">${tiles}</div></div></section><section id="cars"><div class="wrap"><div class="head"><h2>${esc(p.section)}</h2><p class="text">${esc(p.sectionText)}</p></div><div class="cars">${renderCards(cars)||'<p class="text">Залиште заявку — підберемо доступний варіант.</p>'}</div></div></section><section><div class="wrap"><div class="head"><h2>Часті питання</h2></div><div class="faq">${faq}</div></div></section><section><div class="wrap"><div class="head"><h2>Схожі варіанти</h2></div>${related}</div></section><section><div class="wrap"><div class="cta"><h2>Підберемо варіант під вашу ситуацію</h2><p>Вкажіть бюджет, бажаний перший внесок, місто та комфортний щомісячний платіж. Фінальні умови залежать від конкретної програми та результату розгляду заявки.</p><a class="btn" href="/anketa?src=${encodeURIComponent(p.src)}">Залишити заявку</a></div></div></section></main><footer><div class="wrap">© 2026 SoloDealer · <a href="/">Каталог</a> · <a href="/faq">FAQ</a> · <a href="/pro-solodealer">Про нас</a></div></footer></body></html>`;
    res.setHeader('Content-Type','text/html; charset=utf-8');
    res.setHeader('Cache-Control','public, max-age=0, s-maxage=900');
    return res.status(200).send(html);
  }catch(e){console.error('seo landing',e);return res.status(500).send('Page error')}
};
