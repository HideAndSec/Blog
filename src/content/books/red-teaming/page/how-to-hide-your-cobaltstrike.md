---
title: "How to Hide Your CobaltStrike"
slug: "how-to-hide-your-cobaltstrike"
priority: 8
editor: "wysiwyg"
revisionCount: 2
id: 62
createdAt: "2021-06-27T03:53:32Z"
createdBy: "boschko"
updatedAt: "2021-06-27T06:46:08Z"
updatedBy: "boschko"
ownedBy: "boschko"
views: 9
---
<h3 id="bkmrk-cobaltstrike-overvie">CobaltStrike Overview</h3>
<p id="bkmrk-cobalt-strike-is-the">Cobalt Strike is the most prevalent threat emulation software packages used by infosec red team. Often referred to as CS in the industry.</p>
<p id="bkmrk-it-has-become-an-ind">It has become an indispensable weapon in penetration testing and red teams. It has a variety of protocol hosted online methods, integrated privilege escalation, credential export, port forwarding, socket proxy, office attack, file bundling, phishing and other functions. At the same time, Cobalt Strike can also call other well-known tools such as Mimikatz, so it is widely loved by hackers.<br>Project official website: <a href="https://www.cobaltstrike.com">https://www.cobaltstrike.com</a></p>
<p id="bkmrk-cs-has-become-so-wid">CS has become so widely used that most of its out-of-the box characteristics have been identified and even marked by WAF manufacturers. To lean more about this I would STRONGLY recommend the following blogs.</p>
<ol id="bkmrk-detecting-exposed-co"><li><span style="text-decoration: underline;"><a href="https://labs.f-secure.com/blog/detecting-exposed-cobalt-strike-dns-redirectors/">Detecting Exposed Cobalt Strike DNS Redirectors</a></span> - by F-Secure</li>
<li id="bkmrk-analyzing-cobalt-str"><span style="text-decoration: underline;"><a href="https://www.randhome.io/blog/2020/12/20/analyzing-cobalt-strike-for-fun-and-profit/">Analyzing Cobalt Strike for Fun and Profit</a></span> - by Etienne “tek” Maynier</li>
</ol><p id="bkmrk-think-about-it.-if-a">Think about it. If a WAF can spot CS traffic, and ban your IP then the source can eventually be traces and using a <span style="text-decoration: underline;"><a href="https://github.com/shanfenglan/bruteforce_cs_pwd/blob/main/brute_cs_pwd.py">simple BF</a><a href="https://github.com/shanfenglan/bruteforce_cs_pwd/blob/main/brute_cs_pwd.py"> script</a> </span>your C2 is compromised as it will eventually become overwhelmed. We NEED to hide our CS.</p>
<p id="bkmrk-"><a href="/uploads/images/gallery/2021-06/0Q6iOWRHY5OBQmJV-image-1624766955594.png" target="_blank" rel="noopener"><img class="align-center" src="/uploads/images/gallery/2021-06/scaled-1680-/0Q6iOWRHY5OBQmJV-image-1624766955594.png" alt="image-1624766955594.png"></a></p>
<h3 id="bkmrk-1.-modify-the-defaul">1. Modify the default port</h3>
<p id="bkmrk-first-things-first%2C-">First things first, you have to change the teamserver port. If port 50050 is open for whats essentially the controller that's no good your C2 is too easy to identify. For example, any server using port 50050 that also provides an HTTP response unique to NanoHTTPD web servers is more likely a Cobalt Strike server than one found to only exhibit an HTTP response signature.</p>
<p id="bkmrk--0"><a href="/uploads/images/gallery/2021-06/8bJga6Uv3TTa00IC-image-1624767231691.png" target="_blank" rel="noopener"><img src="/uploads/images/gallery/2021-06/scaled-1680-/8bJga6Uv3TTa00IC-image-1624767231691.png" alt="image-1624767231691.png"></a></p>
<p id="bkmrk--1"><a href="/uploads/images/gallery/2021-06/Oc7teuKP9hd904Xp-image-1624767789826.png" target="_blank" rel="noopener"><img src="/uploads/images/gallery/2021-06/scaled-1680-/Oc7teuKP9hd904Xp-image-1624767789826.png" alt="image-1624767789826.png"></a></p>
<p id="bkmrk-%C2%A0"> </p>
<p id="bkmrk-2.">2.</p>
<p id="bkmrk-%C2%A0-0"> </p>
<h3 id="bkmrk-3.-remove-the-certif">3. Remove the certificate feature</h3>
<p id="bkmrk-the-default-certific">The default certificate of Cobalt Strike has been marked as bad by the waf manufacturer. We need to regenerate a new certificate. Here we use the keytool certificate tool that comes with the JDK to generate a new certificate.</p>
<p id="bkmrk-you-can-use-the-keyt">You can use the keytool command in linux. </p>
<div data-lang="tw-data-text tw-text-large XcVN5d tw-ta" id="bkmrk-keytoolkey-and-certi">
<div>
<pre><code class="language-XML">keytool<br>Key and certificate management tools<br><br>command:<br><br> -certreq Generate certificate request<br> -changealias change the alias of the entry<br> -delete delete entry<br> -exportcert export certificate<br> -genkeypair Generate key pair<br> -genseckey Generate key<br> -gencert generates a certificate based on the certificate request<br> -importcert import certificate or certificate chain<br> -importpass import password<br> -importkeystore imports one or all entries from other keystores<br> -keypasswd changes the key password of the entry<br> -list lists the entries in the keystore<br> -printcert print certificate content<br> -printcertreq print the content of the certificate request<br> -printcrl print the contents of the CRL file<br> -storepasswd change the storage password of the keystore<br><br>Use "keytool -command_name -help" to get the usage of command_name</code></pre>
</div>
</div>
<p id="bkmrk-theres-a-bit-of-data">Theres a bit of data in the key-store, but for the most part it contains: Key entity-secret key or private key and paired public key (using asymmetric encryption) Trusted certificate entries-only public key.</p>
<p id="bkmrk--2"><a href="/uploads/images/gallery/2021-06/N0CA8qlOHJXJ9DEr-image-1624776342099.png" target="_blank" rel="noopener"><img src="/uploads/images/gallery/2021-06/scaled-1680-/N0CA8qlOHJXJ9DEr-image-1624776342099.png" alt="image-1624776342099.png"></a></p>
<p id="bkmrk-%E2%80%8B%E2%80%8Bcheck-the-default-">​​Check the default certificate of cs, the password is 123456​</p>
<p id="bkmrk-%C2%A0-1"> </p>
<p id="bkmrk-%C2%A0-2"> </p>
<p id="bkmrk-%C2%A0-3"> </p>
