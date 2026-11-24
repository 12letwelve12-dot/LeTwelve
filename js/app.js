(() => {
const $=s=>document.querySelector(s), KEY="letwelve-cart";
let cart=[]; try{cart=JSON.parse(localStorage.getItem(KEY)||"[]");if(!Array.isArray(cart))cart=[];}catch{cart=[];}
const money=n=>`${Number(n).toFixed(2).replace(/\.00$/,"")} €`;
const esc=v=>String(v).replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));
function render(){let count=$("#cartCount"),items=$("#cartItems"),sub=$("#subtotal");if(count)count.textContent=cart.reduce((n,x)=>n+(+x.qty||0),0);if(items)items.innerHTML=cart.length?cart.map((x,i)=>`<div class="cart-row"><div><b>${esc(x.name)}</b><small>Talla ${esc(x.size||"—")} · ${+x.qty||1} ud.</small><small>${money((+x.price||0)*(+x.qty||1))}</small></div><button class="remove" data-remove="${i}">Eliminar</button></div>`).join(""):'<p class="empty">Tu carrito está vacío.</p>';if(sub)sub.textContent=money(cart.reduce((n,x)=>n+(+x.price||0)*(+x.qty||1),0));}
function save(){localStorage.setItem(KEY,JSON.stringify(cart));render();}
window.LetwelveCart={add(item){let sku=item.sku||`${item.id||item.name}-${item.size||""}`,old=cart.find(x=>x.sku===sku),qty=Math.max(1,+item.qty||1);if(old)old.qty+=qty;else cart.push({...item,sku,qty});save();}};
document.addEventListener("click",e=>{let b=e.target.closest("[data-remove]");if(b){cart.splice(+b.dataset.remove,1);save();}});
if($("#cartOpen"))$("#cartOpen").onclick=()=>document.body.classList.add("cart-open");
if($("#cartClose"))$("#cartClose").onclick=()=>document.body.classList.remove("cart-open");
if($("#backdrop"))$("#backdrop").onclick=()=>document.body.classList.remove("cart-open");
if($("#checkout"))$("#checkout").onclick=()=>alert("El pago todavía no está conectado.");
if($(".menu-toggle")&&$("#nav"))$(".menu-toggle").onclick=()=>$("#nav").classList.toggle("open");
if($("#nav"))$("#nav").querySelectorAll("a").forEach(a=>a.onclick=()=>$("#nav").classList.remove("open"));
if($("#year"))$("#year").textContent=new Date().getFullYear();
const popup=$("#discountPopup"),form=$("#leadMagnetForm"),close=$("#popupClose");
const hide=()=>{if(popup)popup.classList.remove("show");sessionStorage.setItem("letwelve-lead-closed","1");};
if(popup&&!sessionStorage.getItem("letwelve-lead-closed"))setTimeout(()=>popup.classList.add("show"),5000);
if(close)close.onclick=hide;
if(popup)popup.addEventListener("click",e=>{if(e.target===popup)hide();});
if(form)form.onsubmit=async e=>{
  e.preventDefault();
  const d=new FormData(form);
  const name=String(d.get("name")||"").trim();
  const email=String(d.get("email")||"").trim();
  const consent=form.querySelector('input[type="checkbox"]');
  const button=form.querySelector('button[type="submit"]');
  const note=form.querySelector("small") || form.querySelector(".form-note");
  if(!name||!email||!consent||!consent.checked)return;
  if(button){button.disabled=true;button.textContent="ENVIANDO…";}
  const siteId="VnZnjU";
  const listId="U7BLdG";
  const payload={
    data:{
      type:"subscription",
      attributes:{
        custom_source:"LeTwelve - Popup 10%",
        profile:{data:{type:"profile",attributes:{
          email,
          first_name:name,
          subscriptions:{email:{marketing:{consent:"SUBSCRIBED"}}}
        }}}
      },
      relationships:{list:{data:{type:"list",id:listId}}}
    }
  };
  try{
    const response=await fetch(`https://a.klaviyo.com/client/subscriptions/?company_id=${encodeURIComponent(siteId)}`,{
      method:"POST",
      headers:{"accept":"application/vnd.api+json","content-type":"application/vnd.api+json","revision":"2026-10-15"},
      body:JSON.stringify(payload)
    });
    if(!response.ok){
      let detail="";try{const body=await response.json();detail=body.errors?.map(x=>x.detail||x.title).join(" ")||JSON.stringify(body);}catch{}
      throw new Error(detail||`Klaviyo ha respondido ${response.status}`);
    }
    form.innerHTML='<h2>¡YA LO TIENES!</h2><p>Gracias por apuntarte a LeTwelve.</p><p>Tu código de descuento:</p><strong class="discount-code">LETWELVE10</strong><p class="form-note">Si tienes activada la confirmación doble, revisa tu correo para confirmar la suscripción.</p><button type="button" class="button" id="leadDone">SEGUIR COMPRANDO</button>';
    $("#leadDone").onclick=hide;
  }catch(error){
    console.error("Error al conectar el popup con Klaviyo:",error);
    let msg=form.querySelector(".klaviyo-error");
    if(!msg){msg=document.createElement("small");msg.className="klaviyo-error";msg.setAttribute("role","alert");form.appendChild(msg);}
    msg.textContent="No se ha podido completar el registro. " + error.message;
    if(button){button.disabled=false;button.textContent="CONSEGUIR MI 10%";}
  }
};
render();
if("serviceWorker"in navigator&&location.protocol.startsWith("http"))addEventListener("load",()=>navigator.serviceWorker.register("./sw.js").catch(()=>{}));
})();