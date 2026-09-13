const THEME_BOOTSTRAP = `(function(){try{var k="theme";var s=localStorage.getItem(k);var m=document.cookie.match(/(?:^|; )theme=([^;]*)/);var c=m?decodeURIComponent(m[1]):null;var stored=(s==="light"||s==="dark")?s:((c==="light"||c==="dark")?c:null);var t=stored||(window.matchMedia("(prefers-color-scheme: dark)").matches?"dark":"light");document.documentElement.setAttribute("data-theme",t);localStorage.setItem(k,t);document.cookie=k+"="+t+";path=/;max-age=31536000;SameSite=Lax"}catch(e){}})();`

const NAV_FORM_FACTOR_BOOTSTRAP = `(function(){try{var mq=window.matchMedia("(max-width: 768px)");function a(){var m=mq.matches||/Mobi|Android|iPhone|iPad|iPod|Windows Phone/i.test(navigator.userAgent);document.documentElement.setAttribute("data-nav-form-factor",m?"mobile":"desktop");document.documentElement.classList.toggle("navbar-mobile-dock",m)}a();if(mq.addEventListener){mq.addEventListener("change",a)}else if(mq.addListener){mq.addListener(a)}window.addEventListener("resize",a)}catch(e){}})();`

export function SiteBootstrapScripts() {
  return (
    <>
      <script id="site-theme-bootstrap" dangerouslySetInnerHTML={{ __html: THEME_BOOTSTRAP }} />
      <script id="nav-form-factor-bootstrap" dangerouslySetInnerHTML={{ __html: NAV_FORM_FACTOR_BOOTSTRAP }} />
    </>
  )
}
