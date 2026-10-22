---
title: "Brève introduction"
slug: "brève-introduction"
chapter: "fr-introduction-aux-buffer-overflow"
priority: 0
editor: "wysiwyg"
revisionCount: 6
id: 23
createdAt: "2020-05-06T13:09:26Z"
createdBy: "z3pp"
updatedAt: "2020-05-07T15:01:07Z"
updatedBy: "z3pp"
ownedBy: "z3pp"
views: 13
---
<h4 id="bkmrk-tout-d%27abord-qu%27est-"><strong>Tout d'abord qu'est ce qu'un buffer overflow? Et à quoi ça sert?</strong></h4>
<p id="bkmrk-les-buffer-overflow-">Les buffer overflow sont des failles nous permettant d'exploiter une vulnérablilité presente dans un fichier binaire afin de pouvoir lui faire executer ce que l'on veut (enfin quasiment ^^).<br>Le plus souvent on lui fait executer un shell, chose qui peut être très utile, par exemple si le binaire à des permissions SUID ou si il tourne sur un port en remote.</p>
<p id="bkmrk-quelques-notions-de-"><strong>Quelques notions de base à connaitre avant d'attaquer cet article:</strong></p>
<p id="bkmrk-%C2%A0--la-gestion-de-la-"><strong> - La gestion de la mémoire</strong></p>
<p id="bkmrk-%C2%A0--le-fonctionnement"><strong> - Le fonctionnement de la stack</strong></p>
<p id="bkmrk-%C2%A0--et-quelques-bases"><strong> - Et quelques bases en assembleur</strong></p>
<h4 id="bkmrk-th%C3%A9orie"><strong>Rappel</strong></h4>
<p id="bkmrk-pour-commencer-nous-">Pour commencer je vais vous faire un petit rappel sur le déroulement de notre pile (stack) sur un programme qui va tout simplement attendre une entrée utilisateur (stdin) pour ensuite nous l'afficher (stdout)</p>
<pre id="bkmrk-%23include-%3Cunistd.h%3E-"><code class="language-C">#include &lt;unistd.h&gt;
#include &lt;stdio.h&gt;

void vuln() {
    char buffer[32];
    read(0, buffer, 128);
    puts(buffer);
}

int main() {
    vuln();
}</code></pre>
<p id="bkmrk-nous-allons-ensuite-">Nous allons ensuite compiler ce programme sans aucune protections, et en 32bit</p>
<p id="bkmrk-gcc--m32--fno-stack-"><code>gcc -m32 -fno-stack-protector -no-pie -zexecstack -o vuln vuln.c</code></p>
<p id="bkmrk-executons-ce-program">Executons ce programme:</p>
<pre id="bkmrk-%24-.%2Fvuln-aaaaaaaaaaa"><code class="language-shell">$ ./vuln
AAAAAAAAAAA
AAAAAAAAAAA

$</code></pre>
<p id="bkmrk-tout-se-d%C3%A9roule-comm">Tout se déroule comme prévu</p>
<p id="bkmrk-maintenant-voyons-vo">Et voici à quoi la stack ressemblait lorsque nous avons entrée nos "A":</p>
<pre id="bkmrk-0xbfff0000%3A-41-41-41"><code class="language-">0xbfff0000: 41 41 41 41
0xbfff0004: 41 41 41 41
0xbfff0008: 41 41 41 00
...
0xbfff0020: 30 00 ff bf  &lt;- sEBP
0xbfff0024: f0 84 04 08  &lt;- sEIP</code></pre>
<p id="bkmrk-si-pour-vous-tout-es">Si pour vous tout est bon on peut donc passer à la suite!</p>
