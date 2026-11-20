import type{VercelRequest,VercelResponse}from'@vercel/node';import{createClient}from'@supabase/supabase-js';
export default async function handler(req:VercelRequest,res:VercelResponse){
 if(req.method!=='POST')return res.status(405).json({error:'Método no permitido'});
 const header=req.headers.authorization||'',token=header.startsWith('Bearer ')?header.slice(7):'';
 const{SUPABASE_URL,SUPABASE_SERVICE_ROLE_KEY,GITHUB_TOKEN}=process.env;
 if(!token||!SUPABASE_URL||!SUPABASE_SERVICE_ROLE_KEY||!GITHUB_TOKEN)return res.status(503).json({error:'Falta autenticación o configuración privada del backend.'});
 const db=createClient(SUPABASE_URL,SUPABASE_SERVICE_ROLE_KEY),{data:{user},error}=await db.auth.getUser(token);
 if(error||!user)return res.status(401).json({error:'Sesión inválida'});
 const b=req.body||{},pkg=String(b.packageName||''),name=String(b.appName||'').trim(),version=String(b.versionName||''),code=Number(b.versionCode),kind=String(b.contentType||'');
 const parts=pkg.split('.'),validPackage=parts.length>=2&&parts.every((p:string)=>/^[A-Za-z][A-Za-z0-9_]*$/.test(p)),v=version.split('.');
 if(!name||name.length>40||!validPackage||v.length!==3||v.some((x:string)=>!/^\\d+$/.test(x))||!Number.isInteger(code)||code<1||!['url','html','zip','code'].includes(kind))return res.status(400).json({error:'Datos de aplicación no válidos'});
 let sourceUrl='';
 if(kind==='url'){try{const u=new URL(String(b.url));if(!['http:','https:'].includes(u.protocol))throw new Error('protocolo')}catch{return res.status(400).json({error:'URL no válida'})}}
 else{const path=String(b.sourcePath||'');if(!path.startsWith(user.id+'/'))return res.status(400).json({error:'Archivo no válido'});const{data,error:e}=await db.storage.from('sources').createSignedUrl(path,3600);if(e)return res.status(400).json({error:'No se pudo acceder al archivo'});sourceUrl=data.signedUrl}
 const id=crypto.randomUUID(),{error:insert}=await db.from('builds').insert({id,user_id:user.id,app_name:name,package_name:pkg,version_name:version,version_code:code,content_type:kind,status:'queued',source_path:b.sourcePath||null});
 if(insert)return res.status(500).json({error:'No se pudo guardar la compilación'});
 const owner=process.env.GITHUB_OWNER||'scriptsvoidrey',repo=process.env.GITHUB_REPO||'Generador-Build-';
 const dispatch=await fetch('https://api.github.com/repos/'+owner+'/'+repo+'/actions/workflows/build-apk.yml/dispatches',{method:'POST',headers:{Authorization:'Bearer '+GITHUB_TOKEN,Accept:'application/vnd.github+json','X-GitHub-Api-Version':'2022-11-28','Content-Type':'application/json'},body:JSON.stringify({ref:'main',inputs:{build_id:id,app_name:name,package_name:pkg,version_name:version,version_code:String(code),content_type:kind,source_url:sourceUrl,web_url:String(b.url||'')}})});
 if(!dispatch.ok){await db.from('builds').update({status:'error',error_message:'GitHub Actions no pudo iniciar el trabajo'}).eq('id',id);return res.status(502).json({error:'GitHub Actions rechazó la compilación. Revisa el token y el workflow.'})}
 return res.status(202).json({id,status:'queued'});
}