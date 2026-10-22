---
title: "Bug Bounty - Content Discovery / Recon"
slug: "bug-bounty-content-discovery-recon"
priority: 6
editor: "markdown"
revisionCount: 2
id: 78
createdAt: "2022-09-24T00:27:12Z"
createdBy: "mxrch"
updatedAt: "2025-07-10T16:06:33Z"
updatedBy: "blackwasp"
ownedBy: "mxrch"
views: 7
---
<p id="bkmrk-obtain-subdomains-an">Obtain subdomains and links from the target host:</p>
<pre id="bkmrk-for-h-in-%24%28cat-hosts"><code class="language-bash">for h in $(cat hosts.txt); do curl -siL https://$h|egrep -io "[0-9a-z_\-\.]+\.([0-9a-z_\-]+)?`echo $h|awk -F '.' '{print $(NF-1)}'`([0-9a-z_\-\.]+)?\.[a-z]{1,5}"|sort -fu ; done</code></pre>
<p id="bkmrk-obtain-subdomain-and">Obtain subdomain and V-host enumeration:</p>
<pre id="bkmrk-gobuster-dns--r-8.8."><code class="language-bash">gobuster dns -r 8.8.8.8 --wildcard -d targetdomain.com -t 50 -c -i -w ~/SecLists/Discovery/DNS/subdomains-top1million-20000.txt -z -q &gt; tmp.txt &amp;&amp; cat tmp.txt | cut -d' ' -f2 | sort -u &gt; subs.txt &amp;&amp; cat tmp.txt | cut -d' ' -f3 | tr -d '[]' | sort -u -V &gt; hosts.txt</code></pre>
<p id="bkmrk-obtain-subdomains-us">Obtain subdomains using Crt.sh:</p>
<pre id="bkmrk-curl--s-https%3A%2F%2Fdns."><code class="language-bash">curl -s https://dns.bufferover.run/dns?q=.targetdomain.com |jq -r .FDNS_A[]|cut -d',' -f2|sort -u</code></pre>
<p id="bkmrk-obtain-subdomains-us-0">Obtain subdomains using WebArchive:</p>
<pre id="bkmrk-curl--s-%22http%3A%2F%2Fweb."><code class="language-bash">curl -s "http://web.archive.org/cdx/search/cdx?url=*.targetdomain.com/*&amp;output=text&amp;fl=original&amp;collapse=urlkey" |sort| sed -e 's_https*://__' -e "s/\/.*//" -e 's/:.*//' -e 's/^www\.//' | uniq</code></pre>
<p id="bkmrk-obtain-subdomains-us-1">Obtain subdomains using Hackertarget:</p>
<pre id="bkmrk-curl-https%3A%2F%2Fapi.hac"><code class="language-bash">curl https://api.hackertarget.com/hostsearch/?q=targetdomain.com | grep -o '\w.*targetdomain.com'</code></pre>
<p id="bkmrk-enumerate-hosts-from">Enumerate hosts from SSL certificates:</p>
<pre id="bkmrk-echo-%7C-openssl-s_cli"><code class="language-bash">echo | openssl s_client -connect https://targetdomain.com:443 | openssl x509 -noout -text | grep DNS</code></pre>
<p id="bkmrk-finding-site-endpoin">Finding site endpoints using CommonCrawl:</p>
<pre id="bkmrk-echo-%22targetdomain.c"><code class="language-bash">echo "targetdomain.com" | xargs -I domain curl -s "http://index.commoncrawl.org/CC-MAIN-2018-22-index?url=*.domain&amp;output=json" | jq -r .url | sort -u</code></pre>
<p id="bkmrk-grab-titles-of-webpa">Grab titles of webpages:</p>
<pre id="bkmrk-for-i-in-%24%28cat-webse"><code class="language-bash">for i in $(cat Webservers.txt ); do echo "$i | $(curl --connect-timeout 0.5 $i -so - | grep -iPo '(?&lt;=&lt;title&gt;)(.*)(?=&lt;/title&gt;)')"; done </code></pre>
<p id="bkmrk-netcat-scanner-for-h">netcat scanner for HTTP servers:</p>
<pre id="bkmrk-for-i-in-%24%28seq-1-255"><code class="language-bash">for i in $(seq 1 255); do nc -n -v -z "192.168.1.$i" 80 | grep "open"; done | tee webservers.txt</code></pre>
<p id="bkmrk-manually-perform-a-h">Manually perform a HTTP request:</p>
<pre id="bkmrk-%23-manually-perform-a"><code class="language-bash"> # Manually perform a HTTP Get Request
echo -ne "GET / HTTP/1.0\n\n" | nc www.redspin.com 80

# Manually perform a HTTP Get Request on a SSL Port
echo -ne "GET / HTTP/1.0\n\n" | socat – OPENSSL:www.website.com:443,verify=0</code></pre>
<p id="bkmrk-create-a-local-tcp-p">Create a local TCP pipe to a remote SSL port (to allow netcat to probe a SSL service):</p>
<pre id="bkmrk-socat--vd-tcp-listen"><code class="language-bash">socat -vd TCP-LISTEN:8888,fork OPENSSL:www.redspin.com:443,verify=0</code></pre>
<p id="bkmrk-perform-a-check-on-a">Perform a check on a list of webservers (HTTP or HTTPS): HOST:PORT -&gt; HOST:PORT | WEB SERVER | HTML Title:</p>
<pre id="bkmrk-cat-webservers.txt-%7C"><code class="language-bash">cat webservers.txt | xargs -P10 -I'{}' bash -c '(curl -Liks -m2 "https://{}" || curl -Liks -m2 "{}") | grep -iao -e "^Server: .*" -e "" | sed "s#Server: \(.*\)#|\1|#i;s###ig" | tr -d "\r\n" | sed "1s/^/{}/;\$a\\" | sed "s/^\([^|]*\)|$/\1||/"' | tee webserver_info.txt</code></pre>
<h4 id="bkmrk-check-if-trace-is-en">Check if Trace is enabled on a given website:</h4>
<pre id="bkmrk-echo--ne-%22trace-%2Fsom"><code class="language-bash">echo -ne "TRACE /something HTTP/1.0\nX-Header: Trace Enabled\n\n" | socat - OPENSSL:www.website.com:443,verify=0</code></pre>
<h4 id="bkmrk-simple-https-%28ssl%29-l">Simple HTTPS (SSL) Listener with a bad self-signed server certificate:</h4>
<pre id="bkmrk-echo--ne-%22%5Cn%5Cn%5Cn%5Cn%5Cn"><code class="language-bash">echo -ne "\n\n\n\n\n\n\n" | openssl req -new -newkey rsa:1024 -days 1 -nodes -x509 -keyout out.pem -out out.pem ; openssl s_server -cert out.pem -www</code></pre>
<h4 id="bkmrk-printing-ip-addresse">Printing IP addresses of scope + some magic:</h4>
<pre id="bkmrk-%23-sort-by-ip-address"><code class="language-bash"># Sort by IP Addresses
sort -n -t. -k1,1 -k2,2 -k3,3 -k4,4

# Print IP addresses in a file
egrep -o '[[:digit:]]{1,3}\.[[:digit:]]{1,3}\.[[:digit:]]{1,3}\.[[:digit:]]{1,3}'

#Print IP address in all files in the current directory tree with some pretty color matching
find . -type f -exec egrep -a -H -n --color=auto '[[:digit:]]{1,3}\.[[:digit:]]{1,3}\.[[:digit:]]{1,3}\.[[:digit:]]{1,3}' {} \;</code></pre>
<p id="bkmrk-%C2%A0-1"> </p>
<p id="bkmrk-%C2%A0-2"> </p>
<p id="bkmrk-%C2%A0-3"> </p>
<hr id="bkmrk-"><h4 id="bkmrk-by-boschko">By Boschko</h4>
<ul id="bkmrk-my-hack-the-box%3A-htt"><li class="graf graf--p">My Hack The Box: <a class="markup--anchor markup--p-anchor" href="https://www.hackthebox.eu/home/users/profile/37879" target="_blank" rel="nofollow noopener" data-href="https://www.hackthebox.eu/home/users/profile/37879">https://www.hackthebox.eu/home/users/profile/37879</a></li>
<li class="graf graf--p">My Website: <a class="markup--anchor markup--p-anchor" href="https://olivierlaflamme.github.io/" target="_blank" rel="noopener nofollow noopener" data-href="https://olivierlaflamme.github.io/">https://olivierlaflamme.github.io/</a></li>
<li class="graf graf--p">My GitHub: <a class="markup--anchor markup--p-anchor" href="https://github.com/OlivierLaflamme" target="_blank" rel="noopener nofollow noopener" data-href="https://github.com/OlivierLaflamme">https://github.com/OlivierLaflamme</a></li>
<li class="graf graf--p">My WeChat QR below:</li>
</ul><figure id="bkmrk--15" class="graf graf--figure graf--layoutOutsetLeft"><img class="graf-image" src="https://cdn-images-1.medium.com/max/750/0*Jh0zrZrfyn8WjkDn.png" data-image-id="0*Jh0zrZrfyn8WjkDn.png" data-width="142" data-height="144"></figure><p id="bkmrk-%C2%A0-4"> </p>
