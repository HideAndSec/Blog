---
title: "NorthSec 2021 Badge Writeup"
slug: "northsec-2021-badge-writeup"
priority: 4
editor: "wysiwyg"
revisionCount: 61
id: 58
createdAt: "2021-06-03T20:16:27Z"
createdBy: "boschko"
updatedAt: "2021-06-18T03:07:12Z"
updatedBy: "boschko"
ownedBy: "boschko"
views: 85
---
<p id="bkmrk-%C2%A0"><a href="/uploads/images/gallery/2021-06/5A3I094wJr9THP9z-sharing-facebook.png" target="_blank" rel="noopener"><img class="align-center" src="/uploads/images/gallery/2021-06/scaled-1680-/5A3I094wJr9THP9z-sharing-facebook.png" alt="sharing-facebook.png" width="242" height="127"></a><a href="/uploads/images/gallery/2021-06/6KjmNXtOr9TPVeYy-image-1622752920246.jpg" target="_blank" rel="noopener"><img class="align-center" src="/uploads/images/gallery/2021-06/scaled-1680-/6KjmNXtOr9TPVeYy-image-1622752920246.jpg" alt="image-1622752920246.jpg" width="461" height="461"></a></p>
<p id="bkmrk-to-learn-more-about-">To learn more about the badge itself and the development behind the scenes I would recommend watching this <span style="text-decoration: underline;"><a href="https://www.youtube.com/watch?v=zkiFeA-PHm0&amp;t=392s">YouTube</a></span> video.</p>
<p id="bkmrk-although-northsec-wa">Although NorthSec was remote for the second year in a row the badges still formed the bases of a CTF. However the badge's challenges were completely unrelated to the actual competitive CTF which was one of the highlights from the event as far as I was concerned.</p>
<p id="bkmrk-the-badge-itself-hol">The badge itself hold 10 flags which is really impressive given the memory on the chip and the engineering behind it all. The different categories of the flag are trivia, general problem solving, and reverse engineering. All challenges are independent from each other, so you can look for flags in any order. The lore behind the badge follows the theme of the 2021 northsec: medieval</p>
<p id="bkmrk-this-was-also-my-fir">This was also my first time doing any type of hardware hacking. Because of this I have to thank vicious,  Padraignix, and Eric Hogue for giving me gentle hints without spoiling any of the fun. <a href="https://padraignix.github.io/ctf/2021/05/30/nsec2021-badgelife-pt1/#introduction"><span style="text-decoration: underline;">Padraignix</span></a> and <a href="https://erichogue.ca/2021/05/NorthSec2021BadgeFirstFlags/"><span style="text-decoration: underline;">Eric</span></a> have writeup's of their own. If there is something I explain poorly go check them out and their approach.</p>
<h3 id="bkmrk-flag-%231">Flag #1 / Intro</h3>
<p id="bkmrk-this-flag-was-one-of">The first flag is one of theose "warmup" flags. There is visibly a chest in the upper left hand side of the screen, visible upon booting up the game.</p>
<p id="bkmrk--0"><a href="/uploads/images/gallery/2021-06/Lg0wWFqlfB02UZVN-image-1622754805550.png" target="_blank" rel="noopener"><img src="/uploads/images/gallery/2021-06/scaled-1680-/Lg0wWFqlfB02UZVN-image-1622754805550.png" alt="image-1622754805550.png"></a></p>
<p id="bkmrk-this-is-our-first-fl">This is our first flag <code>FLAG-W3lc0m2NSECxx</code></p>
<p id="bkmrk--1"><a href="/uploads/images/gallery/2021-06/npm4Cp6lkLn5unNs-190627853-536067121105153-1103174546858507288-n.jpg" target="_blank" rel="noopener"><img src="/uploads/images/gallery/2021-06/scaled-1680-/npm4Cp6lkLn5unNs-190627853-536067121105153-1103174546858507288-n.jpg" alt="190627853_536067121105153_1103174546858507288_n.jpg"></a></p>
<p id="bkmrk-%C2%A0-2">You submit the flags through the FLAGBOT on the official NorthSec Discord server and by some magic it syncs up to your badge.</p>
<p id="bkmrk--2"><a href="/uploads/images/gallery/2021-06/GV1wwRBXIKBazvC6-image-1622753645694.png" target="_blank" rel="noopener"><img class="align-center" src="/uploads/images/gallery/2021-06/scaled-1680-/GV1wwRBXIKBazvC6-image-1622753645694.png" alt="image-1622753645694.png"></a></p>
<h3 id="bkmrk-flag-%232-toms-hut">Flag #8 / Toms Hut Part 1</h3>
<p id="bkmrk-i-spent-a-good-20-mi">I spent a good 20 minutes talking to all the NPC's and going around the map. Eventually I walked into a house presumably owned by someone named Tom.</p>
<p id="bkmrk--3"><a href="/uploads/images/gallery/2021-06/qt0z2wocZ3ayoaTK-image-1622757863410.png" target="_blank" rel="noopener"><img class="align-center" src="/uploads/images/gallery/2021-06/scaled-1680-/qt0z2wocZ3ayoaTK-image-1622757863410.png" alt="image-1622757863410.png"></a></p>
<p id="bkmrk--4"><a href="/uploads/images/gallery/2021-06/V0hZ9jBjE0zdercT-image-1622851840559.png" target="_blank" rel="noopener"><img src="/uploads/images/gallery/2021-06/scaled-1680-/V0hZ9jBjE0zdercT-image-1622851840559.png" alt="image-1622851840559.png"></a></p>
<p id="bkmrk-inside-tom%27s-hut-we-">Inside Tom's hut we are greeted with the following message</p>
<p id="bkmrk--5"><a href="/uploads/images/gallery/2021-06/HP2O5xhrW4S5dhJ7-image-1622757931633.png" target="_blank" rel="noopener"><img class="align-center" src="/uploads/images/gallery/2021-06/scaled-1680-/HP2O5xhrW4S5dhJ7-image-1622757931633.png" alt="image-1622757931633.png"></a></p>
<p id="bkmrk-i-also-remember-goin">I also remember seeing a house with a WiFi symbol on it.</p>
<p id="bkmrk--6"><a href="/uploads/images/gallery/2021-06/2dLxqemICminBe5o-image-1622755974619.png" target="_blank" rel="noopener"><img src="/uploads/images/gallery/2021-06/scaled-1680-/2dLxqemICminBe5o-image-1622755974619.png" alt="image-1622755974619.png"></a></p>
<p id="bkmrk-once-you-enter-that-">Once you enter that house you see the following:</p>
<p id="bkmrk--7"><a href="/uploads/images/gallery/2021-06/0GR3TWPDUXOiJzNj-image-1622755999622.png" target="_blank" rel="noopener"><img src="/uploads/images/gallery/2021-06/scaled-1680-/0GR3TWPDUXOiJzNj-image-1622755999622.png" alt="image-1622755999622.png"></a></p>
<p id="bkmrk-unfortunately-it-onl">Unfortunately we're only allowed to toggle the WiFi on and off without any connection to any network being established. Thankfully this badge has a CLI feature that I used to connect to the WiFi using the serial connection.</p>
<p id="bkmrk--8"><a href="/uploads/images/gallery/2021-06/SUAqjFJFFVbEeWOR-image-1622756221975.png" target="_blank" rel="noopener"><img class="align-center" src="/uploads/images/gallery/2021-06/scaled-1680-/SUAqjFJFFVbEeWOR-image-1622756221975.png" alt="image-1622756221975.png"></a></p>
<p id="bkmrk-we%27ll-use-dmesg-to-s">We'll use dmesg to see if the nsec badge is detected and sure enough it is!</p>
<p id="bkmrk--9"><a href="/uploads/images/gallery/2021-06/goVUWT0X2L9dJVMv-image-1622756539623.png" target="_blank" rel="noopener"><img src="/uploads/images/gallery/2021-06/scaled-1680-/goVUWT0X2L9dJVMv-image-1622756539623.png" alt="image-1622756539623.png"></a></p>
<p id="bkmrk-so-we%27ll-just-connec">So we'll just connect to it using the screen command to connect to the GUI. Below we see what commands we've got to play with.</p>
<p id="bkmrk--10"><a href="/uploads/images/gallery/2021-06/en9bZBY5ujbxSAn9-image-1622756711783.png" target="_blank" rel="noopener"><img src="/uploads/images/gallery/2021-06/scaled-1680-/en9bZBY5ujbxSAn9-image-1622756711783.png" alt="image-1622756711783.png"></a></p>
<p id="bkmrk--11"><a href="/uploads/images/gallery/2021-06/qZKKmR7uRGRQex5M-image-1622756752761.png" target="_blank" rel="noopener"><img src="/uploads/images/gallery/2021-06/scaled-1680-/qZKKmR7uRGRQex5M-image-1622756752761.png" alt="image-1622756752761.png"></a></p>
<p id="bkmrk-using-the-commands-a">Using the commands above we connected ourselves to our home WiFi</p>
<p id="bkmrk--12"><a href="/uploads/images/gallery/2021-06/oKCQpWJJXObKKS5U-image-1622757432242.png" target="_blank" rel="noopener"><img src="/uploads/images/gallery/2021-06/scaled-1680-/oKCQpWJJXObKKS5U-image-1622757432242.png" alt="image-1622757432242.png"></a></p>
<p id="bkmrk-now-when-you-enter-t">Now when you go back to Tom's hut you're welcomed with the following message:</p>
<p id="bkmrk--13"><a href="/uploads/images/gallery/2021-06/8K5F2AsrHnRTdEyT-rev11.PNG" target="_blank" rel="noopener"><img src="/uploads/images/gallery/2021-06/scaled-1680-/8K5F2AsrHnRTdEyT-rev11.PNG" alt="rev1(1).PNG"></a></p>
<p id="bkmrk-so-lets-go-ahead-and">So lets go ahead and get those files and see what Tom's got in store for us.</p>
<p id="bkmrk--14"><a href="/uploads/images/gallery/2021-06/cR99VVP86DuZRgdY-image-1622758602280.png" target="_blank" rel="noopener"><img src="/uploads/images/gallery/2021-06/scaled-1680-/cR99VVP86DuZRgdY-image-1622758602280.png" alt="image-1622758602280.png"></a></p>
<p id="bkmrk-we-will-start-with-t">We will start with the rc101 challenge then solve the rc102. The rc101.zip contains a .elf in a Tensilica Xtensa format. This will be a first for me because I've never touched Xtensa architecture. After a fair amount of googling I was able to find a <a href="https://github.com/yath/ghidra-xtensa"><span style="text-decoration: underline;">Ghidra module</span></a> that could read this type of format.</p>
<p id="bkmrk--15"><a href="/uploads/images/gallery/2021-06/nrYVm3L8x7NVwF6k-image-1622758810039.png" target="_blank" rel="noopener"><img src="/uploads/images/gallery/2021-06/scaled-1680-/nrYVm3L8x7NVwF6k-image-1622758810039.png" alt="image-1622758810039.png"></a></p>
<p id="bkmrk--16"><a href="/uploads/images/gallery/2021-06/UGOm3ypam7nWmjpj-image-1622760604090.png" target="_blank" rel="noopener"><img class="align-center" src="/uploads/images/gallery/2021-06/scaled-1680-/UGOm3ypam7nWmjpj-image-1622760604090.png" alt="image-1622760604090.png"></a></p>
<p id="bkmrk-with-this-module-loa">With this module loaded, everything ran smoothly. So I went ahead and loaded up the <code>app_main</code> from this we can get a rough idea of whats happening.</p>
<p id="bkmrk-its-actually-quite-s">Its actually quite straight forward</p>
<ol id="bkmrk-0x400d2360-user-supp"><li>0x400d2360 user supplied input</li>
<li>0x400d2381 makes a check to see input is whats expected</li>
<li>0x400d2386 if expected, succeed, then load flag in register</li>
<li>0x400d2390 if fail, jump to try_again</li>
</ol><p id="bkmrk--17"><a href="/uploads/images/gallery/2021-06/XJX2ohPzlNVxuI9u-image-1622761631084.png" target="_blank" rel="noopener"><img src="/uploads/images/gallery/2021-06/scaled-1680-/XJX2ohPzlNVxuI9u-image-1622761631084.png" alt="image-1622761631084.png"></a></p>
<p id="bkmrk-the-verify-function-">The Verify function is is kinda long. Essentially our offset is the flag. Just from looking at this function there is a glaring pattern present. If you stare at it for 30 seconds you'll see that there is a jump of 0x4 each time which is then validating our user input (a1). The validation is being performed against values loaded in the a8 to a15 registers.</p>
<p id="bkmrk--18"><a href="/uploads/images/gallery/2021-06/NPeRUKnroyL0h8wD-image-1622762183402.png" target="_blank" rel="noopener"><img src="/uploads/images/gallery/2021-06/scaled-1680-/NPeRUKnroyL0h8wD-image-1622762183402.png" alt="image-1622762183402.png"></a></p>
<p id="bkmrk-so-what-we-take-the-">So what we'll do is take the register values and build it back up sequentially one at a time... maybe there is a sick 1337 way to do it in Ghidra but I did in manually in a notepad. I'm sure there is a smarter quicker way to do this but this will have to do.</p>
<p id="bkmrk--19"><a href="/uploads/images/gallery/2021-06/I3zFmU43pbzx6Dbm-image-1622763201488.png" target="_blank" rel="noopener"><img src="/uploads/images/gallery/2021-06/scaled-1680-/I3zFmU43pbzx6Dbm-image-1622763201488.png" alt="image-1622763201488.png"></a></p>
<p id="bkmrk-this-leaves-you-with">This leaves you with <code class="language-plaintext highlighter-rouge">11a922186c46496eb1317c128b361720</code> which we'll submit to the challenge as user input to receive our flag.</p>
<p id="bkmrk-so-the-flag-is%3A-flag"><a href="/uploads/images/gallery/2021-06/3bpRQRKyELvfsFZM-image-1622763106918.png" target="_blank" rel="noopener"><img class="align-center" src="/uploads/images/gallery/2021-06/scaled-1680-/3bpRQRKyELvfsFZM-image-1622763106918.png" alt="image-1622763106918.png"></a>So the flag is: <code>flag-REverSINg_xteNSA_is_NOt_that_HArd</code></p>
<p id="bkmrk--20"><a href="/uploads/images/gallery/2021-06/iEGkigkMPNWyVRPC-image-1622763233834.png" target="_blank" rel="noopener"><img class="align-center" src="/uploads/images/gallery/2021-06/scaled-1680-/iEGkigkMPNWyVRPC-image-1622763233834.png" alt="image-1622763233834.png"></a></p>
<h3 id="bkmrk-flag-%239-%2F-toms-hut-p">Flag #9 / Toms Hut Part 2</h3>
<p id="bkmrk-its-not-over-yet-we-">Its not over yet! We still have another reverse challenge to do. So after some light recon we're going to be dealing with more or less the same architecture.</p>
<p id="bkmrk--21"><a href="/uploads/images/gallery/2021-06/2FGpNYR9gPgWlFXq-image-1622763471098.png" target="_blank" rel="noopener"><img src="/uploads/images/gallery/2021-06/scaled-1680-/2FGpNYR9gPgWlFXq-image-1622763471098.png" alt="image-1622763471098.png"></a></p>
<p id="bkmrk-so-we-seem-to-be-dea">Lets jump in and look at our main.</p>
<p id="bkmrk--22"><a href="/uploads/images/gallery/2021-06/6U1EZhNyAtD7zCgf-image-1622764325952.png" target="_blank" rel="noopener"><img src="/uploads/images/gallery/2021-06/scaled-1680-/6U1EZhNyAtD7zCgf-image-1622764325952.png" alt="image-1622764325952.png"></a></p>
<p id="bkmrk-for-a-second-i-thoug">For a second I thought that I loaded the wrong app because the main looks exactly the same but the verify function is very different.</p>
<p id="bkmrk--23"><a href="/uploads/images/gallery/2021-06/eMN0h9EesiIlKLdX-image-1622764392751.png" target="_blank" rel="noopener"><img src="/uploads/images/gallery/2021-06/scaled-1680-/eMN0h9EesiIlKLdX-image-1622764392751.png" alt="image-1622764392751.png"></a></p>
<p id="bkmrk-%C2%A0-1">The way I understand it is that something will move something from an offset of ctx to the register a9. So you are comparing a9 with the ascii of a8 before counting down to the next block just like before. Therefore we're going to move the asii value of a8 then compare both, if they're equal we jump to the next block, and if not it makes a jump, resets ctx and return from the function. This in my head is easier to understand then the previous challenge's verify function.</p>
<p id="bkmrk--24"><a href="/uploads/images/gallery/2021-06/YMl1ICcBsBiksUcq-image-1622766411790.png" target="_blank" rel="noopener"><img class="align-center" src="/uploads/images/gallery/2021-06/scaled-1680-/YMl1ICcBsBiksUcq-image-1622766411790.png" alt="image-1622766411790.png"></a></p>
<ol id="bkmrk-move-input-from-ctx-"><li class="align-left">move input from ctx to a9</li>
<li class="align-left">a8 = 0x66 = f</li>
<li class="align-left">compare a9 with 0x66</li>
<li class="align-left">if equal then move onto next block</li>
</ol><p id="bkmrk--25"><a href="/uploads/images/gallery/2021-06/RbNF0BwzI4hOQEd6-image-1622766888775.png" target="_blank" rel="noopener"><img src="/uploads/images/gallery/2021-06/scaled-1680-/RbNF0BwzI4hOQEd6-image-1622766888775.png" alt="image-1622766888775.png"></a></p>
<p id="bkmrk-this-leaves-us-with-">This leaves us with <code>f219e6cdb1fa4a48b160d00d61118f93</code> which we'll submit to the challenge as user input to receive our flag.</p>
<p id="bkmrk--26"><a href="/uploads/images/gallery/2021-06/X2UJg9MfJJIJSBV1-image-1622766791781.png" target="_blank" rel="noopener"><img class="align-center" src="/uploads/images/gallery/2021-06/scaled-1680-/X2UJg9MfJJIJSBV1-image-1622766791781.png" alt="image-1622766791781.png"></a></p>
<p id="bkmrk-so-the-flag-is%3A-flag-0">So the flag is: <code>flag-this_is_a_big_huge_enormous_condition</code></p>
<h3 id="bkmrk--27"><a href="/uploads/images/gallery/2021-06/LpE1YgOGyP9bD9GV-image-1622767021920.png" target="_blank" rel="noopener"><img class="align-center" src="/uploads/images/gallery/2021-06/scaled-1680-/LpE1YgOGyP9bD9GV-image-1622767021920.png" alt="image-1622767021920.png"></a></h3>
<h3 id="bkmrk-flag-%232-%2F-konami">Flag #2 / Konami</h3>
<p id="bkmrk-i%27m-actually-impress">I'm actually impressed I thought of this one. After solving the first 3 flags I didn't really know what to solve next but there was a chest in the top left corner of the map that looked inaccessible.</p>
<p id="bkmrk--28"><a href="/uploads/images/gallery/2021-06/3he7o776DYfiD7PE-image-1622767925234.png" target="_blank" rel="noopener"><img src="/uploads/images/gallery/2021-06/scaled-1680-/3he7o776DYfiD7PE-image-1622767925234.png" alt="image-1622767925234.png"></a></p>
<p id="bkmrk-for-a-while-i-though">For a while I thought I needed to find a bug with the collision detection but then I remembered this was a video game! And EVERY video game has cheats!... Right? At first I tried the most popular "walking through walls cheats" but had no success with those. However when I googled the most popular cheat codes did I find success.</p>
<p id="bkmrk--29"><a href="/uploads/images/gallery/2021-06/tCaB80MdSuqh11tT-meme1.PNG" target="_blank" rel="noopener"><img src="/uploads/images/gallery/2021-06/scaled-1680-/tCaB80MdSuqh11tT-meme1.PNG" alt="meme(1).PNG" width="756" height="537"></a></p>
<p id="bkmrk--30"><a href="/uploads/images/gallery/2021-06/LP5Cs3rBEvW1g3P5-image-1622767863045.png" target="_blank" rel="noopener"><img class="align-center" src="/uploads/images/gallery/2021-06/scaled-1680-/LP5Cs3rBEvW1g3P5-image-1622767863045.png" alt="image-1622767863045.png"></a></p>
<p id="bkmrk-perhaps-its-because-">Perhaps its because its the most popular one? But the Konami/Contra code opened the door on the first try. I'm not quite sure if a different cheat codes would have also worked but once entered a magical door will open!</p>
<p id="bkmrk--31"><a href="/uploads/images/gallery/2021-06/0jW2L3oF6OACWdEu-image-1622768106290.png" target="_blank" rel="noopener"><img class="align-center" src="/uploads/images/gallery/2021-06/scaled-1680-/0jW2L3oF6OACWdEu-image-1622768106290.png" alt="image-1622768106290.png"></a></p>
<p id="bkmrk--32"><a href="/uploads/images/gallery/2021-06/RxQKFMbtGwg1Cx1i-image-1622768245269.png" target="_blank" rel="noopener"><img class="align-center" src="/uploads/images/gallery/2021-06/scaled-1680-/RxQKFMbtGwg1Cx1i-image-1622768245269.png" alt="image-1622768245269.png"></a></p>
<p id="bkmrk-going-to-the-chest-w">Just go through the door to the chest to receive the second flag! <code>FLAG-UuDdLrLrBA0000</code></p>
<p id="bkmrk--33"><a href="/uploads/images/gallery/2021-06/8SvT5wsFHwF7tBEW-image-1622768415131.png" target="_blank" rel="noopener"><img class="align-center" src="/uploads/images/gallery/2021-06/scaled-1680-/8SvT5wsFHwF7tBEW-image-1622768415131.png" alt="image-1622768415131.png"></a></p>
<h3 id="bkmrk-flag-%235-%2F-cyber-punk">Flag #5 / Cyber Punk</h3>
<p id="bkmrk-i-kinda-got-this-fla">I kinda got this flag by accident. Right after getting flag #2 I randomly also got flag #4 and I was trying to figure out where it came from. I investigated by talking to the 10 or so NPC's scattered around the map to see if their text options had changed. Eventually I had to chase down the NPC with pink hair named "Punk_" (seen below).</p>
<p id="bkmrk--34"><a href="/uploads/images/gallery/2021-06/Kf8eumkDtx0bErtN-image-1622912752087.png" target="_blank" rel="noopener"><img src="/uploads/images/gallery/2021-06/scaled-1680-/Kf8eumkDtx0bErtN-image-1622912752087.png" alt="image-1622912752087.png"></a></p>
<p id="bkmrk-personally-this-npc-">Personally this NPC (like the dog) never stopped walking and my fat fingers stumbled but eventually I got to his ass. </p>
<p id="bkmrk--35"><a href="/uploads/images/gallery/2021-06/FxO7lPUZXUOTMRXH-image-1622912991245.png" target="_blank" rel="noopener"><img src="/uploads/images/gallery/2021-06/scaled-1680-/FxO7lPUZXUOTMRXH-image-1622912991245.png" alt="image-1622912991245.png"></a></p>
<p id="bkmrk-when-you-talk-to-him">When you talk to this absolute chad he's all about making you prove yourself to him. You need to be cool and have a lot of money, and be 1337... as seen below.</p>
<p id="bkmrk--36"><a href="/uploads/images/gallery/2021-06/TqrWdCLCuBq47bDB-pink21.PNG" target="_blank" rel="noopener"><img src="/uploads/images/gallery/2021-06/scaled-1680-/TqrWdCLCuBq47bDB-pink21.PNG" alt="pink2(1).PNG"></a></p>
<p id="bkmrk-so-i-walked-away-a-l">Since I'm none of the above I walked away a little too quickly, hitting the down key and triggering the following.</p>
<p id="bkmrk--37"><a href="/uploads/images/gallery/2021-06/FQRmevHS4V480TqK-pink31.PNG" target="_blank" rel="noopener"><img src="/uploads/images/gallery/2021-06/scaled-1680-/FQRmevHS4V480TqK-pink31.PNG" alt="pink3(1).PNG"></a></p>
<p id="bkmrk-and-with-that-we-get">With that we get flag #5 I still don't know how I got flag #4 though... But we'll figure it out eventually. <code>FLAG-KLJV490uhkEJF28</code></p>
<p id="bkmrk--38"><a href="/uploads/images/gallery/2021-06/sj8Z9tlqfiqXM9Kd-image-1623124309998.png" target="_blank" rel="noopener"><img src="/uploads/images/gallery/2021-06/scaled-1680-/sj8Z9tlqfiqXM9Kd-image-1623124309998.png" alt="image-1623124309998.png"></a></p>
<h3 id="bkmrk-flag-%237-%2F-read-the-s">Flag #7 / 20:20 Vision</h3>
<p id="bkmrk-due-to-the-reset-but">Due to the reset button being at the back of the badge accidentally rebooted the game multiple time as it laid flat on my desk.</p>
<p id="bkmrk--39"><a href="/uploads/images/gallery/2021-06/VL0vIvrc3IHqzjRZ-reset1.PNG" target="_blank" rel="noopener"><img src="/uploads/images/gallery/2021-06/scaled-1680-/VL0vIvrc3IHqzjRZ-reset1.PNG" alt="reset(1).PNG"></a></p>
<p id="bkmrk-in-doing-so-i-notice">In doing so I noticed the following message:</p>
<p id="bkmrk--40"><a href="/uploads/images/gallery/2021-06/mJ5qjtkd3UkCsHlH-image-1622770872391.png" target="_blank" rel="noopener"><img src="/uploads/images/gallery/2021-06/scaled-1680-/mJ5qjtkd3UkCsHlH-image-1622770872391.png" alt="image-1622770872391.png"></a></p>
<p id="bkmrk-%C2%A0-5">So I started going through the alphabet tab-completing like a maniac and eventually it completed to the_sword_of_azeroth! (a world of warcraft reference)</p>
<p id="bkmrk--41"><a href="/uploads/images/gallery/2021-06/GnKo0zE3sz87sXLB-image-1622777834918.png" target="_blank" rel="noopener"><img src="/uploads/images/gallery/2021-06/scaled-1680-/GnKo0zE3sz87sXLB-image-1622777834918.png" alt="image-1622777834918.png"></a></p>
<p id="bkmrk-and-with-this-we-hav">And with this we have the  7th flag <code>FLAG-Cl1F0rFun&amp;Pr0f1t</code></p>
<p id="bkmrk--42"><a href="/uploads/images/gallery/2021-06/xYzYum2nGbqUwFF4-image-1622777871711.png" target="_blank" rel="noopener"><img class="align-center" src="/uploads/images/gallery/2021-06/scaled-1680-/xYzYum2nGbqUwFF4-image-1622777871711.png" alt="image-1622777871711.png"></a></p>
<h3 id="bkmrk-flag-%236-%2F-le-lack-du">Flag #6 / Le Lack Du Quack</h3>
<p id="bkmrk-if-you-walk-around-t">If you walk around the map you'll run into a pretty mean looking duck chilling in a pond.</p>
<p id="bkmrk--43"><a href="/uploads/images/gallery/2021-06/7i1vQakENi60FDoi-image-1622854371822.PNG" target="_blank" rel="noopener"><img src="/uploads/images/gallery/2021-06/scaled-1680-/7i1vQakENi60FDoi-image-1622854371822.PNG" alt="image-1622854371822.PNG"></a></p>
<p id="bkmrk-he-doesn%27t-say-much-">He doesn't say much besides quack.</p>
<p id="bkmrk--44"><a href="/uploads/images/gallery/2021-06/iPiUzglpkC5SAJoe-quack1.PNG" target="_blank" rel="noopener"><img src="/uploads/images/gallery/2021-06/scaled-1680-/iPiUzglpkC5SAJoe-quack1.PNG" alt="quack(1).PNG"></a></p>
<p id="bkmrk-but-i-noticed-that-a">But I noticed that as soon as I started interacting with him that my CLI segfault. I connected to the CLI in a few different ways as seen below.</p>
<pre id="bkmrk-minicom---device-%2Fde"><code class="language-">minicom --device /dev/ttyUSB0
screen /dev/ttyUSB0 115200
tio /dev/ttyUSB0 
picocom -b 115200 /dev/ttyUSB0</code></pre>
<p id="bkmrk-but-they-all-left-me">But they all left me with a similar shell.</p>
<p id="bkmrk--45"><a href="/uploads/images/gallery/2021-06/nMNVTvwmnJH2TKN9-image-1622854942693.png" target="_blank" rel="noopener"><img src="/uploads/images/gallery/2021-06/scaled-1680-/nMNVTvwmnJH2TKN9-image-1622854942693.png" alt="image-1622854942693.png"></a></p>
<p id="bkmrk-but-it-appears-that-">It appears that there was output before it segfaults we see it display "quickquickquick" which kinds sounds like "quack", the noise a duck would make. So I went ahead and piped this into a file.</p>
<p id="bkmrk--46"><a href="/uploads/images/gallery/2021-06/OnUSwszEsUNTd0Ds-image-1622855668525.png" target="_blank" rel="noopener"><img src="/uploads/images/gallery/2021-06/scaled-1680-/OnUSwszEsUNTd0Ds-image-1622855668525.png" alt="image-1622855668525.png"></a></p>
<p id="bkmrk-at-first-i-though-my">At first I though my terminal was broken but I kept getting the same weird output. I ended up installing a new VM but nothing changed.</p>
<p id="bkmrk--47"><a href="/uploads/images/gallery/2021-06/ZCsgZTlqevOZIyPK-image-1622908314372.png" target="_blank" rel="noopener"><img src="/uploads/images/gallery/2021-06/scaled-1680-/ZCsgZTlqevOZIyPK-image-1622908314372.png" alt="image-1622908314372.png"></a></p>
<p id="bkmrk-its-only-when-i-deci">Its only when I decided properly check the end of those lines that I realize maybe there might be a message here...</p>
<p id="bkmrk--48"><a href="/uploads/images/gallery/2021-06/q9QLxq7pxZVvqOjZ-image-1622908365995.png" target="_blank" rel="noopener"><img src="/uploads/images/gallery/2021-06/scaled-1680-/q9QLxq7pxZVvqOjZ-image-1622908365995.png" alt="image-1622908365995.png"></a></p>
<p id="bkmrk-%C2%A0-7">After removing all the gunk I was left with this nice poem.</p>
<pre id="bkmrk-quackquackquickquack"><code class="language-">quackquackquickquack
quickquickquack
quickquack
quackquickquackquick
quackquickquack
quickquick
quackquack
quickquack
quackquickquick
quickquickquack
quackquickquackquick
quackquickquack
quack
quackquackquack
quackquackquick
quick
quack
quackquickquickquick
quickquackquick
quick
quickquack
quackquickquick
quickquickquack
quickquickquick
quick
quack
quickquickquickquick
quickquick
quickquickquick
quickquickquackquick
quickquackquickquick
quickquack
quackquackquick
quackquickquickquick
quackquick
quickquickquickquack
quackquackquickquick
quackquickquack
quickquack
quickquackquack
quackquack
quickquickquick
quackquickquackquack
quickquickquick</code></pre>
<p id="bkmrk-%C2%A0-8">Now there are only two words present quick and quack and some spaces. So maybe the spaces before the newlines are a fluke and they're not suppose to exist. If they are then I'm thinking morse code could be a solution. Also maybe also we can turn the 0's and 1's into text.</p>
<p id="bkmrk-now-when-i-was-talki">Now when I was talking to some of the NPC's one of them really triggered me by what he said...</p>
<p id="bkmrk--49"><a href="/uploads/images/gallery/2021-06/DAUSGYnvGQT3l45R-image-1622909455627.PNG" target="_blank" rel="noopener"><img src="/uploads/images/gallery/2021-06/scaled-1680-/DAUSGYnvGQT3l45R-image-1622909455627.PNG" alt="image-1622909455627.PNG"></a></p>
<p id="bkmrk-everyone-knows-that-">Everyone knows that PHP never left, and will never be die. So I wrote a little script in PHP to get us the output in 0's and 1's and later the morse code.</p>
<pre id="bkmrk-%3C%3Fphp-%24data-%3D-%22quack"><code class="language-PHP">&lt;?php
$data = "quackquackquickquackquickquickquackquickquackquackquickquackquickquackquickquackquickquickquackquackquickquackquackquickquickquickquickquackquackquickquackquickquackquickquackquackquackquackquackquackquackquickquickquackquackquickquickquickquickquackquickquickquickquackquackquickquickquickquickquackquickquickquickquickquackquickquickquickquickquickquickquickquickquickquickquickquackquickquickquackquickquickquickquackquackquackquickquackquickquickquickquackquickquickquickquickquackquackquackquickquickquackquickquackquickquackquickquackquackquackquackquickquickquickquackquickquackquackquickquickquick" ;
$data = str_replace( "quick" , "0" , $data);
$data = str_replace( "quack" , "1" ,$data);
echo $data = str_replace( " " , "." ,$data);
?&gt;</code></pre>
<p id="bkmrk-this-left-us-with-tw">This left us with two combinations:</p>
<pre id="bkmrk-11010010110101010011"><code class="language-">1101001011010101001101100001101010111111100110000100011000010000100000000000100100011101000100001110010101011110001011000

0010110100101010110010011110010101000000011001111011100111101111011111111111011011100010111011110001101010100001110100111</code></pre>
<p id="bkmrk-its-at-this-point-th">This didn't really amount to much and cyber-chef sent me the following sms.</p>
<p id="bkmrk--50"><a href="/uploads/images/gallery/2021-06/wVUtiV4g5YqtXW79-image-1622911794984.png" target="_blank" rel="noopener"><img src="/uploads/images/gallery/2021-06/scaled-1680-/wVUtiV4g5YqtXW79-image-1622911794984.png" alt="image-1622911794984.png"></a></p>
<p id="bkmrk-its-at-this-point-th-0">Its at this point that I realized that perhaps my gut feeling was right and went ahead to confirm my initial suspicion. The new lines did act as spaces after all. Morse code needs spaces so I made some tweaks to my robust PHP code and obtained the following message as seen below:</p>
<p id="bkmrk--51"><a href="/uploads/images/gallery/2021-06/MoV0ekLp7o3HmFfA-image-1622911346335.png" target="_blank" rel="noopener"><img src="/uploads/images/gallery/2021-06/scaled-1680-/MoV0ekLp7o3HmFfA-image-1622911346335.png" alt="image-1622911346335.png"></a></p>
<p id="bkmrk-%22quack-im-a-duck-to-">"QUACK IM A DUCK TO GET BREAD USE THIS FLAG BNVZKAWMSYS" so the flag is therefore <code>FLAGBNVZKAWMSYS</code></p>
<p id="bkmrk--52"><a href="/uploads/images/gallery/2021-06/dSglysTzktPyHfSt-image-1622911491654.png" target="_blank" rel="noopener"><img src="/uploads/images/gallery/2021-06/scaled-1680-/dSglysTzktPyHfSt-image-1622911491654.png" alt="image-1622911491654.png"></a></p>
<h3 id="bkmrk-flag-%234-%2F-pay-attent">Flag #3 / A Fisherman's Downfall</h3>
<p id="bkmrk-it-at-around-this-ti">It at around this time that I start feeling like I'm going to have to swim in the deep end of the pool. Again I have no real hardware reversing experience. One thing I do want to do is extract all the textures from the application and see if I can reconstruct the map. But before we get to that there is a female NPC which gives us our next hint to a flag.</p>
<p id="bkmrk--53"><a href="/uploads/images/gallery/2021-06/5B04RkDoMdcsIqXZ-image-1622835820155.PNG" target="_blank" rel="noopener"><img src="/uploads/images/gallery/2021-06/scaled-1680-/5B04RkDoMdcsIqXZ-image-1622835820155.PNG" alt="image-1622835820155.PNG"></a></p>
<p id="bkmrk-whats-important-to-n">Whats important to note is that the NPC's don't ask questions they all speak in funny infosec anecdotes.</p>
<p id="bkmrk--54"><a href="/uploads/images/gallery/2021-06/EzKWC3VKDqzYtaGu-image-1622835827333.PNG" target="_blank" rel="noopener"><img src="/uploads/images/gallery/2021-06/scaled-1680-/EzKWC3VKDqzYtaGu-image-1622835827333.PNG" alt="image-1622835827333.PNG"></a></p>
<p id="bkmrk-at-this-point-i-thou">At this point I thought that I needed to render the other side of the shore and that maybe a flag was printed on it. In case it isn't obvious as far as I know the shore isn't visible / inaccessible by our character. Also we cant swim. I was a little stumped at this point so I had to ask for a light hint.</p>
<p id="bkmrk--55"><a href="/uploads/images/gallery/2021-06/nYqVYS5Njf6wQJuk-image-1622835236228.png" target="_blank" rel="noopener"><img src="/uploads/images/gallery/2021-06/scaled-1680-/nYqVYS5Njf6wQJuk-image-1622835236228.png" alt="image-1622835236228.png"></a></p>
<p id="bkmrk-after-some-light-goo">After some light googling I fell on <a href="https://github.com/espressif/esptool"><span style="text-decoration: underline;">this GitHub</span></a> which looked to be exactly what I was looking for. As can be seen below I had a lot of issues in dumping the flash. It didn't seem to matter what I ran or how I ran it...</p>
<p id="bkmrk--56"><a href="/uploads/images/gallery/2021-06/n2lKWt2lrfZ0usYx-image-1622843297920.png" target="_blank" rel="noopener"><img src="/uploads/images/gallery/2021-06/scaled-1680-/n2lKWt2lrfZ0usYx-image-1622843297920.png" alt="image-1622843297920.png"></a></p>
<p id="bkmrk--57"><a href="/uploads/images/gallery/2021-06/NKDh5LWQGnR9LzIn-image-1622843537251.png" target="_blank" rel="noopener"><img src="/uploads/images/gallery/2021-06/scaled-1680-/NKDh5LWQGnR9LzIn-image-1622843537251.png" alt="image-1622843537251.png"></a></p>
<p id="bkmrk-it-was-only-after-pe">For the next several hours I kept failing and nothing was working. Some progress was made along the way however.</p>
<p id="bkmrk--58"><a href="/uploads/images/gallery/2021-06/S4EyXVHZtndp7qAS-image-1622843964017.png" target="_blank" rel="noopener"><img src="/uploads/images/gallery/2021-06/scaled-1680-/S4EyXVHZtndp7qAS-image-1622843964017.png" alt="image-1622843964017.png"></a></p>
<p id="bkmrk-it-took-roughly-50-t">We know that the firmware is ~16M thanks to the function above. Then I just started playing around, lowering the Baud rate, switching cables and USB ports which proved to have its successes but no cigar.</p>
<p id="bkmrk--59"><a href="/uploads/images/gallery/2021-06/30JdVZtRPx8jDvjC-image-1622847786412.png" target="_blank" rel="noopener"><img src="/uploads/images/gallery/2021-06/scaled-1680-/30JdVZtRPx8jDvjC-image-1622847786412.png" alt="image-1622847786412.png"></a></p>
<p id="bkmrk--60"><a href="/uploads/images/gallery/2021-06/gD30nrQe6MIk2qL4-image-1622847934041.png" target="_blank" rel="noopener"><img src="/uploads/images/gallery/2021-06/scaled-1680-/gD30nrQe6MIk2qL4-image-1622847934041.png" alt="image-1622847934041.png"></a></p>
<p id="bkmrk-at-this-point-it-see">At this point it seemed like dumping the whole firmware was impossible. I spend roughly 4h on this trying different techniques but nothing worked. Mentally I was here:</p>
<p id="bkmrk--61"><iframe src="//www.youtube.com/embed/tvVS1hVw3kc" width="560" height="314" allowfullscreen="allowfullscreen"></iframe></p>
<p id="bkmrk-i-started-reaching-p">I started asking around on discord. The general consensus was that the CH340 chip wasn't the most reliable when it came to this type of thing. Thats when a hero named <span style="color: #ff6600;">Padraignix </span>came to my aid. He told me that he had a very similar experience and only got a full dump on his ~40th attempt. So not all hope was lot. After harping on discord for a while longer another hero appeared named <span style="color: #00ff00;">vicious </span>who laid down some general tips. </p>
<p id="bkmrk--62"><a href="/uploads/images/gallery/2021-06/4VG6hLt8puBqSs3A-image-1622852150726.png" target="_blank" rel="noopener"><img src="/uploads/images/gallery/2021-06/scaled-1680-/4VG6hLt8puBqSs3A-image-1622852150726.png" alt="image-1622852150726.png"></a></p>
<p id="bkmrk-but-it-seems-like-i-">But it seems like I could reliably grab around 2MB of the firmware.</p>
<p id="bkmrk--63"><a href="/uploads/images/gallery/2021-06/VavQhr8i89RvLXzj-image-1622851398197.png" target="_blank" rel="noopener"><img src="/uploads/images/gallery/2021-06/scaled-1680-/VavQhr8i89RvLXzj-image-1622851398197.png" alt="image-1622851398197.png"></a></p>
<p id="bkmrk-so-lets-just-try-and">So lets just try and get 1MB and be happy...</p>
<p id="bkmrk--64"><a href="/uploads/images/gallery/2021-06/FFXc6fI3FotEId95-image-1622852499379.png" target="_blank" rel="noopener"><img src="/uploads/images/gallery/2021-06/scaled-1680-/FFXc6fI3FotEId95-image-1622852499379.png" alt="image-1622852499379.png"></a></p>
<p id="bkmrk-and-after-all-that-s">And after all that struggle we got a flag?!?! <code>FLAG-JTAGPower0verwhelming</code></p>
<p id="bkmrk--65"><a href="/uploads/images/gallery/2021-06/y6Ffpbtmwz4lELH1-image-1622852577789.png" target="_blank" rel="noopener"><img src="/uploads/images/gallery/2021-06/scaled-1680-/y6Ffpbtmwz4lELH1-image-1622852577789.png" alt="image-1622852577789.png"></a></p>
<p id="bkmrk--66"><a href="/uploads/images/gallery/2021-06/AgE7WVInM3wUXCLV-image-1622852672299.png" target="_blank" rel="noopener"><img src="/uploads/images/gallery/2021-06/scaled-1680-/AgE7WVInM3wUXCLV-image-1622852672299.png" alt="image-1622852672299.png"></a></p>
<p id="bkmrk-turns-out-this-is-ju">Turns out this is just a bonus flag. Which makes sense because we're on the fisherman woman quest-line. Since I want to parse the textures I was able to find a <a href="https://github.com/tenable/esp32_image_parser"><span style="text-decoration: underline;">open source tool</span></a> that should get the job done. So first we'll list all of the available partition.</p>
<p id="bkmrk--67"><a href="/uploads/images/gallery/2021-06/DrRQmjxSyPXaUBCD-image-1622853519033.png" target="_blank" rel="noopener"><img src="/uploads/images/gallery/2021-06/scaled-1680-/DrRQmjxSyPXaUBCD-image-1622853519033.png" alt="image-1622853519033.png"></a></p>
<p id="bkmrk-the-only-partition-t">The only partition that really interests me is storage and perhaps factory. So lets use the same tool with the help of some flags to</p>
<p id="bkmrk--68"><a href="/uploads/images/gallery/2021-06/pmBOAM5Dm7bQL34n-image-1622853823158.png" target="_blank" rel="noopener"><img src="/uploads/images/gallery/2021-06/scaled-1680-/pmBOAM5Dm7bQL34n-image-1622853823158.png" alt="image-1622853823158.png"></a></p>
<p id="bkmrk-lets-just-use-binwal">Lets just use binwalk because that's the next logical thing to do really, lets hope there are a sufficient amount of images within.</p>
<p id="bkmrk--69"><a href="/uploads/images/gallery/2021-06/27SxWzvQMD9Hjnwj-image-1622853949182.png" target="_blank" rel="noopener"><img src="/uploads/images/gallery/2021-06/scaled-1680-/27SxWzvQMD9Hjnwj-image-1622853949182.png" alt="image-1622853949182.png"></a></p>
<p id="bkmrk--70"><a href="/uploads/images/gallery/2021-06/WtHo5PNIBG52TfQy-image-1622854010292.png" target="_blank" rel="noopener"><img src="/uploads/images/gallery/2021-06/scaled-1680-/WtHo5PNIBG52TfQy-image-1622854010292.png" alt="image-1622854010292.png"></a></p>
<p id="bkmrk-at-this-point-i-thou-0">At this point I thought that maybe I could get the firmware from the github? Since this is northsec and we're past the end of the CTF they should have open sourced it.</p>
<p id="bkmrk--71"><a href="/uploads/images/gallery/2021-06/ThX6VrbBrdwlGNdh-image-1622857443304.png" target="_blank" rel="noopener"><img src="/uploads/images/gallery/2021-06/scaled-1680-/ThX6VrbBrdwlGNdh-image-1622857443304.png" alt="image-1622857443304.png"></a></p>
<p id="bkmrk-i-was-right%2C-but-the">I was right, but the thing I didn't expect to see was the full map of the game!!!</p>
<p id="bkmrk--72"><a href="/uploads/images/gallery/2021-06/DG0nGWfAOgoabjCp-image-1622857506531.png" target="_blank" rel="noopener"><img src="/uploads/images/gallery/2021-06/scaled-1680-/DG0nGWfAOgoabjCp-image-1622857506531.png" alt="image-1622857506531.png"></a></p>
<p id="bkmrk-and-we-can-see-in-th">And we can see in the bottom right corner that there is a chest! Now... listen... I know this is kind of "cheating" since this wasn't available during the actual CTF... but hey I cant dump the whole firmware to solve it the indented way (so far). Anyways from this image I think that we should be able to go out of bounds either at the bottom right of the map near the stone wall, or at the top right near the trees.</p>
<p id="bkmrk-after-some-messing-a">After some messing around I was right and you can go out of bounds right around here:</p>
<p id="bkmrk--73"><a href="/uploads/images/gallery/2021-06/J177TfWZzxHAyHxd-outofb-min.png" target="_blank" rel="noopener"><img src="/uploads/images/gallery/2021-06/scaled-1680-/J177TfWZzxHAyHxd-outofb-min.png" alt="outofb-min.png"></a></p>
<p id="bkmrk-after-going-out-of-b">After going out of bounds you keep going down and start mashing ENTER and you'll open the chest.</p>
<p id="bkmrk--74"><a href="/uploads/images/gallery/2021-06/0DDZ63ovBnIeWYO2-image-1622901598404.png" target="_blank" rel="noopener"><img src="/uploads/images/gallery/2021-06/scaled-1680-/0DDZ63ovBnIeWYO2-image-1622901598404.png" alt="image-1622901598404.png"></a></p>
<p id="bkmrk-so-the-flag-is-flag-">So the flag is <code>FLAG-MfoAkJu0TtD36</code></p>
<p id="bkmrk--75"><a href="/uploads/images/gallery/2021-06/SiMVF4ex5zh3hMVc-image-1622901464109.png" target="_blank" rel="noopener"><img src="/uploads/images/gallery/2021-06/scaled-1680-/SiMVF4ex5zh3hMVc-image-1622901464109.png" alt="image-1622901464109.png"></a></p>
<p id="bkmrk-now-that-was-kinda-c">Now that was kinda cheating so I will also solve it the intended way. Since I wasn't able to dump the firmware myself ill yoink it from the GitHub.</p>
<p id="bkmrk--76"><a href="/uploads/images/gallery/2021-06/VJk9sry0gloTvrbp-image-1622927379773.png" target="_blank" rel="noopener"><img src="/uploads/images/gallery/2021-06/scaled-1680-/VJk9sry0gloTvrbp-image-1622927379773.png" alt="image-1622927379773.png"></a></p>
<p id="bkmrk-now-that-we-have-the">Now that we have the firmware we will replete the previous steps. We'll start of by seeing what partitions we're dealing with and our output should be the same as before.</p>
<p id="bkmrk--77"><a href="/uploads/images/gallery/2021-06/LMWCC2vXmn7f6ITN-image-1622927720381.png" target="_blank" rel="noopener"><img src="/uploads/images/gallery/2021-06/scaled-1680-/LMWCC2vXmn7f6ITN-image-1622927720381.png" alt="image-1622927720381.png"></a></p>
<p id="bkmrk--78"><a href="/uploads/images/gallery/2021-06/u5CzuYLGWRBkxsym-image-1622927811185.png" target="_blank" rel="noopener"><img src="/uploads/images/gallery/2021-06/scaled-1680-/u5CzuYLGWRBkxsym-image-1622927811185.png" alt="image-1622927811185.png"></a></p>
<p id="bkmrk-now-we-have-another-">Now we have another binary file but I don't really know how to read it / what it really is so like any hacker we'll just fuck around and find out. Binwalk to the rescue!</p>
<p id="bkmrk--79"><a href="/uploads/images/gallery/2021-06/PVcThnepVc7dhCW9-image-1622927966696.png" target="_blank" rel="noopener"><img src="/uploads/images/gallery/2021-06/scaled-1680-/PVcThnepVc7dhCW9-image-1622927966696.png" alt="image-1622927966696.png"></a></p>
<p id="bkmrk--80"><a href="/uploads/images/gallery/2021-06/Y9sirBsOKLeN3p27-image-1622928059812.png" target="_blank" rel="noopener"><img src="/uploads/images/gallery/2021-06/scaled-1680-/Y9sirBsOKLeN3p27-image-1622928059812.png" alt="image-1622928059812.png"></a></p>
<p id="bkmrk-alright-do-lets-just">Alright so lets just extract the images and see if we could have figured this out "cheating"</p>
<p id="bkmrk--81"><a href="/uploads/images/gallery/2021-06/8N3Xj18Qb7QPSl0g-image-1622928395784.png" target="_blank" rel="noopener"><img src="/uploads/images/gallery/2021-06/scaled-1680-/8N3Xj18Qb7QPSl0g-image-1622928395784.png" alt="image-1622928395784.png"></a></p>
<p id="bkmrk--82"><a href="/uploads/images/gallery/2021-06/S9npzIYRJmRNr1lR-image-1622928460655.png" target="_blank" rel="noopener"><img src="/uploads/images/gallery/2021-06/scaled-1680-/S9npzIYRJmRNr1lR-image-1622928460655.png" alt="image-1622928460655.png"></a></p>
<p id="bkmrk-...-wait-so-they%27re-">... Wait so they're corrupted?</p>
<p id="bkmrk--83"><a href="/uploads/images/gallery/2021-06/PcC2RQeZNS8uIETo-image-1623130240007.png" target="_blank" rel="noopener"><img src="/uploads/images/gallery/2021-06/scaled-1680-/PcC2RQeZNS8uIETo-image-1623130240007.png" alt="image-1623130240007.png"></a></p>
<p id="bkmrk-at-this-point-i-wasn">At this point I wasn't quite sure what to do... so I went back to cheating a.k.a looking at the GitHub to try and get an understanding of the ESP32 works, how it stores information, and perhaps even if it has a filesystem / hierarchy. I did a lot of googling based off of what I saw in the GitHub. But one thing stood out was "spiffs" as it was being thrown around a lot.</p>
<p id="bkmrk--84"><a href="/uploads/images/gallery/2021-06/34BaGVg5y0wwqSKr-image-1622928614330.png" target="_blank" rel="noopener"><img src="/uploads/images/gallery/2021-06/scaled-1680-/34BaGVg5y0wwqSKr-image-1622928614330.png" alt="image-1622928614330.png"></a></p>
<p id="bkmrk-basically-the-esp32-">Basically the ESP32 uses SPIFFS instead of storage cards like SD cards. This means that with SPIFFS, you can write your code in a separated file and save them on the ESP32 filesystem using magic. SPIFFS lets you access the flash memory like you would do in a normal filesystem in your computer, but simpler and more limited. You can read, write, close, and delete files. So it makes sense that binwalk could recognize some of the file structure but for a reason I don't genuinely fully understand we weren't able to extract the images successfully. My guess is because its in an unknown state only headers were being recognized without their entire contents being present.</p>
<p id="bkmrk-after-even-more-rese">After even more research I discovered a tool called <a href="https://github.com/igrr/mkspiffs">mkspiffs</a> that essentially unpack or list all the files in the spiffs. Now this was a pain in the ass to configure and I don't know what my final make command looked like but finding the proper flags took me around 30 minutes to get right. Basically from the storage dump we're going to rebuild a directory structure in a folder named storage. note that a 1024 fs page size in bytes was the only thing that worked for me.</p>
<p id="bkmrk--85"><a href="/uploads/images/gallery/2021-06/7TobMlWWiXeORJyQ-image-1622930321769.png" target="_blank" rel="noopener"><img src="/uploads/images/gallery/2021-06/scaled-1680-/7TobMlWWiXeORJyQ-image-1622930321769.png" alt="image-1622930321769.png"></a></p>
<p id="bkmrk--86"><a href="/uploads/images/gallery/2021-06/xrO6ibSByYTaET8v-image-1622930439147.png" target="_blank" rel="noopener"><img src="/uploads/images/gallery/2021-06/scaled-1680-/xrO6ibSByYTaET8v-image-1622930439147.png" alt="image-1622930439147.png"></a></p>
<p id="bkmrk-now-i-spend-a-long-3">Now I spend a long 30 minutes just looking around running shitty forensics tool to get an idea of what I had. Through a hint from our previous hero <span style="color: #ff6600;">Padraignix </span>he told us to look into rpg which had 2 files. I didn't know what to make of this at fist but it almost seemed like a bit map I just needed to find the right dimensions.</p>
<p id="bkmrk--87"><a href="/uploads/images/gallery/2021-06/hbVkwmVLfgTgHqwl-image-1622931047671.png" target="_blank" rel="noopener"><img src="/uploads/images/gallery/2021-06/scaled-1680-/hbVkwmVLfgTgHqwl-image-1622931047671.png" alt="image-1622931047671.png"></a></p>
<p id="bkmrk-what-we-end-up-getti">What we end up getting is the following</p>
<p id="bkmrk--88"><a href="/uploads/images/gallery/2021-06/uCUTkZpDb075wr9H-image-1622932253683.png" target="_blank" rel="noopener"><img src="/uploads/images/gallery/2021-06/scaled-1680-/uCUTkZpDb075wr9H-image-1622932253683.png" alt="image-1622932253683.png"></a></p>
<p id="bkmrk-as-you-can-see-it-so">As you can see it somewhat makes sense. But it feels like the areas that should be empty are filled with 0's and the areas that are full are filled with 1's. For example the castle at the bottom of the map doesn't make much sense in this bit array.</p>
<p id="bkmrk--89"><a href="/uploads/images/gallery/2021-06/DYaXpgqLtCD0I22O-image-1622932806869.png" target="_blank" rel="noopener"><img src="/uploads/images/gallery/2021-06/scaled-1680-/DYaXpgqLtCD0I22O-image-1622932806869.png" alt="image-1622932806869.png"></a></p>
<p id="bkmrk-after-a-lot%2C-and-i-m">After A LOT, and I mean A LOT of fuckin about I finally got a map that made sense. With the path that we would have expected.</p>
<p id="bkmrk--90"><a href="/uploads/images/gallery/2021-06/xnj3YQuQy2nSIJ9D-image-1622932727614.png" target="_blank" rel="noopener"><img src="/uploads/images/gallery/2021-06/scaled-1680-/xnj3YQuQy2nSIJ9D-image-1622932727614.png" alt="image-1622932727614.png"></a></p>
<p id="bkmrk-and-i-noticed-someth">And I noticed something interesting with the castle there appears to be a way to get inside the castle!!!</p>
<p id="bkmrk--91"><a href="/uploads/images/gallery/2021-06/13or5pRH0r6r0Cbw-image-1622932933652.png" target="_blank" rel="noopener"><img src="/uploads/images/gallery/2021-06/scaled-1680-/13or5pRH0r6r0Cbw-image-1622932933652.png" alt="image-1622932933652.png"></a></p>
<p id="bkmrk-now-there-wasn%27t-any">Now there wasn't any flags within the castles but there was an "Easter egg" that made me shit my pants.</p>
<p id="bkmrk--92"><a href="/uploads/images/gallery/2021-06/SKXNJU6vpIMc8dOb-image-1622943639916.PNG" target="_blank" rel="noopener"><img src="/uploads/images/gallery/2021-06/scaled-1680-/SKXNJU6vpIMc8dOb-image-1622943639916.PNG" alt="image-1622943639916.PNG"></a></p>
<p id="bkmrk-when-you-go-into-the">When you go into the building there a weird sound then your game just corrupts perpetually the more you move. I seriously thought I destroyed my badge and I was going to have to find a way to reinstall the firmware. But thankfully after the reboot everything was fine. </p>
<p id="bkmrk--93"><a href="/uploads/images/gallery/2021-06/LyVghVagwNUSKDQh-image-1622943663982.PNG" target="_blank" rel="noopener"><img src="/uploads/images/gallery/2021-06/scaled-1680-/LyVghVagwNUSKDQh-image-1622943663982.PNG" alt="image-1622943663982.PNG"></a></p>
<h3 id="bkmrk-flag-%2310-%2F-trauma">Flag #10 / I am 1337</h3>
<p id="bkmrk-i-should-remind-ever">I should remind everyone that at this point I am way out of my comfort zone. This flag can be best described by the following image.</p>
<p id="bkmrk--94"><a href="/uploads/images/gallery/2021-06/pGnWicI5q5XSEbCR-image-1622914572306.png" target="_blank" rel="noopener"><img src="/uploads/images/gallery/2021-06/scaled-1680-/pGnWicI5q5XSEbCR-image-1622914572306.png" alt="image-1622914572306.png"></a></p>
<p id="bkmrk-during-the-previous-">During the previous flag when I was digging quite deep into the source code and I ended up learning a lot about the ESP32. When I was looking for anything pertaining to memory and files I fell face to face with the NVS (non volatile storage) term quite often. There is actually a <a href="https://docs.espressif.com/projects/esp-idf/en/latest/esp32/api-reference/storage/nvs_flash.html"><span style="text-decoration: underline;">library</span></a> that goes in depth into NVS and ESP32.</p>
<p id="bkmrk--95"><a href="/uploads/images/gallery/2021-06/eR4sk4TItA86J0vf-image-1622933725860.png" target="_blank" rel="noopener"><img src="/uploads/images/gallery/2021-06/scaled-1680-/eR4sk4TItA86J0vf-image-1622933725860.png" alt="image-1622933725860.png"></a></p>
<p id="bkmrk-thankfully-the-esp32">Thankfully the <span class="css-truncate css-truncate-target d-block width-fit"><a class="js-navigation-open Link--primary" title="esp32_image_parser.py" href="https://github.com/tenable/esp32_image_parser/blob/master/esp32_image_parser.py" data-pjax="#repo-content-pjax-container">esp32_image_parser.py</a></span> that we've used before has a function to dump nvs. Ill make a quick note that I was given a 3 letter hint "NVS" which is one of the main reasons I investigated this avenue. So we will read the NVS partition from the full firmware dump and go from there. The way I understand it the goal of this exercise would be to read the key pair since NVS is essentially just a storage of key pairs.</p>
<p id="bkmrk--96"><a href="/uploads/images/gallery/2021-06/oCbdJFMIn4e0ZTn8-image-1622934346828.png" target="_blank" rel="noopener"><img src="/uploads/images/gallery/2021-06/scaled-1680-/oCbdJFMIn4e0ZTn8-image-1622934346828.png" alt="image-1622934346828.png"></a></p>
<p id="bkmrk-initially-i-was-runn">Initially I was running shit like this and the output was making no sense</p>
<p id="bkmrk--97"><a href="/uploads/images/gallery/2021-06/EjsfrvcjQ7OsThAJ-image-1622935500246.png" target="_blank" rel="noopener"><img src="/uploads/images/gallery/2021-06/scaled-1680-/EjsfrvcjQ7OsThAJ-image-1622935500246.png" alt="image-1622935500246.png"></a></p>
<p id="bkmrk-but-thankfully-i-wen">But thankfully I went back to read the documentation and was gifted with this snippet of information.</p>
<p id="bkmrk--98"><a href="/uploads/images/gallery/2021-06/dVvbYWqgEhvTQnPj-image-1622935567753.png" target="_blank" rel="noopener"><img src="/uploads/images/gallery/2021-06/scaled-1680-/dVvbYWqgEhvTQnPj-image-1622935567753.png" alt="image-1622935567753.png"></a></p>
<p id="bkmrk-now-i-have-output-th">Now I have output that makes more sense?</p>
<p id="bkmrk--99"><a href="/uploads/images/gallery/2021-06/TFx8GtV1nZkAXfmL-image-1622935684147.png" target="_blank" rel="noopener"><img src="/uploads/images/gallery/2021-06/scaled-1680-/TFx8GtV1nZkAXfmL-image-1622935684147.png" alt="image-1622935684147.png"></a></p>
<p id="bkmrk-one-thing-that-was-a">One thing that was annoying is that you couldn't pipe this into jq or npx so I literally had to use an online tool to make this readable.</p>
<p id="bkmrk--100"><a href="/uploads/images/gallery/2021-06/RsBUPXq4nDD1iX7W-image-1622938025107.png" target="_blank" rel="noopener"><img src="/uploads/images/gallery/2021-06/scaled-1680-/RsBUPXq4nDD1iX7W-image-1622938025107.png" alt="image-1622938025107.png"></a></p>
<p id="bkmrk-so-after-a-lot-of-pa">So after A LOT of pain I finally started understand. Basically when the flash is initialized, the page headers have been written to flash. These page have a valid sequence number. Pages that have some empty entries is where data can be written. No more than one page can be in this state at any given moment. So we need to find the right entry in NVS in which the flag counter is saved / data is written. In theory this should be where our "bitmap state: Written" entry is so we should understand what needs to be modified as far as data when we dump the NVS.</p>
<p id="bkmrk-the-way-i-understand">Again, the way I understand it is that I need to find the right entry since its just a key pair, therefore dumping the NVS partition will be our way to read them. From this point I'm assuming we need to patch it and push it to the firmware with a flag trigger that gives us the 10th flag.</p>
<p id="bkmrk-here-is-the-catch-22">Here is the catch 22. I was not able to dump my firmware myself so I had to use the firmware from the GitHub. That firmware doesn't have any flags solved and therefore saved in its NVS. The issue is that there is no way for me to know how to set a flag if no flags are set in the NVS.</p>
<p id="bkmrk--101"><a href="/uploads/images/gallery/2021-06/2fnftBR5v2Jtcgkc-image-1623103309588.png" target="_blank" rel="noopener"><img src="/uploads/images/gallery/2021-06/scaled-1680-/2fnftBR5v2Jtcgkc-image-1623103309588.png" alt="image-1623103309588.png"></a></p>
<p id="bkmrk-i-had-no-choice-at-t">I had no choice at this point to have someone help me. Thankfully a hero by the name of <span style="color: #00ff00;">EricHogue</span> came to my rescue. And gave me a firmware dump with 1 flag.</p>
<p id="bkmrk--102"><a href="/uploads/images/gallery/2021-06/5uovCD6eYpY4etts-image-1623118223609.png" target="_blank" rel="noopener"><img src="/uploads/images/gallery/2021-06/scaled-1680-/5uovCD6eYpY4etts-image-1623118223609.png" alt="image-1623118223609.png"></a></p>
<p id="bkmrk-then-i-ran-python3-e">Then I ran <code>python3 esp32_image_parser.py dump_nvs -partition nvs nsec2021.bin</code> and <code>python3 esp32_image_parser.py dump_nvs -partition nvs ~/Desktop/badge.bin</code> to compare the two outputs.</p>
<table id="bkmrk-nsec2021.bin-%28from-g" style="border-collapse: collapse; width: 100%; height: 1133px;" border="1"><tbody><tr style="height: 29px;"><td style="width: 50%; height: 29px;">nsec2021.bin (from GitHub)</td>
<td style="width: 50%; height: 29px;">badge.bin (from EricHogue)</td>
</tr><tr style="height: 1104px;"><td style="width: 50%; height: 1104px;">Line 15: Key : storage<br>Line 25: Key : misc<br>Line 36: Key : log<br>Line 50: Key : log<br>Line 63: Key : nvs.net80211<br>Line 74: Key : opmode<br>Line 85: Key : sta.ssid<br>Line 101: Key : sta.ssid<br>Line 115: Key : sta.authmode<br>Line 126: Key : sta.pswd<br>Line 144: Key : sta.pswd<br>Line 158: Key : sta.pmk<br>Line 173: Key : sta.pmk<br>Line 187: Key : sta.chan<br>Line 198: Key : auto.conn<br>Line 209: Key : bssid.set<br>Line 220: Key : sta.bssid<br>Line 234: Key : sta.bssid<br>Line 248: Key : sta.lis_intval<br>Line 259: Key : sta.phym<br>Line 270: Key : sta.phybw<br>Line 281: Key : sta.apsw<br>Line 295: Key : sta.apsw<br>Line 309: Key : sta.apinfo<br>Line 366: Key : sta.apinfo<br>Line 380: Key : sta.scan_method<br>Line 391: Key : sta.sort_method<br>Line 402: Key : sta.minrssi<br>Line 413: Key : sta.minauth<br>Line 424: Key : sta.pmf_e<br>Line 435: Key : sta.pmf_r<br>Line 446: Key : sta.btm_e<br>Line 457: Key : sta.rrm_e<br>Line 468: Key : ap.ssid<br>Line 484: Key : ap.ssid<br>Line 498: Key : ap.passwd<br>Line 516: Key : ap.passwd<br>Line 530: Key : ap.pmk<br>Line 545: Key : ap.pmk<br>Line 559: Key : ap.chan<br>Line 570: Key : ap.authmode<br>Line 581: Key : ap.hidden<br>Line 592: Key : ap.max.conn<br>Line 603: Key : bcn.interval<br>Line 614: Key : ap.phym<br>Line 625: Key : ap.phybw<br>Line 636: Key : ap.sndchan<br>Line 647: Key : ap.pmf_e<br>Line 658: Key : ap.pmf_r<br>Line 669: Key : lorate<br>Line 680: Key : country<br>Line 694: Key : country<br>Line 708: Key : opmode<br>Line 718: Key : phy<br>Line 729: Key : cal_data<br>Line 818: Key : cal_data<br>Line 884: Key : cal_data<br>Line 898: Key : cal_mac<br>Line 912: Key : cal_mac<br>Line 926: Key : cal_version<br>Line 937: Key : opmode</td>
<td style="width: 50%; height: 1104px;">Line 15: Key : namespace_name<br>Line 26: Key : key1<br>Line 294: Key : cal_data<br>Line 359: Key : cal_data<br>Line 372: Key : cal_mac<br>Line 385: Key : cal_mac<br>Line 398: Key : cal_version<br>Line 408: Key : opmode<br>Line 418: Key : save<br>Line 433: Key : save<br>Line 1418: Key : storage<br>Line 1428: Key : misc<br>Line 1439: Key : log<br>Line 1453: Key : log<br>Line 1466: Key : nvs.net80211<br>Line 1477: Key : opmode<br>Line 1488: Key : sta.ssid<br>Line 1504: Key : sta.ssid<br>Line 1518: Key : sta.authmode<br>Line 1529: Key : sta.pswd<br>Line 1547: Key : sta.pswd<br>Line 1561: Key : sta.pmk<br>Line 1576: Key : sta.pmk<br>Line 1590: Key : sta.chan<br>Line 1601: Key : auto.conn<br>Line 1612: Key : bssid.set<br>Line 1623: Key : sta.bssid<br>Line 1637: Key : sta.bssid<br>Line 1651: Key : sta.lis_intval<br>Line 1662: Key : sta.phym<br>Line 1673: Key : sta.phybw<br>Line 1684: Key : sta.apsw<br>Line 1698: Key : sta.apsw<br>Line 1712: Key : sta.apinfo<br>Line 1769: Key : sta.apinfo<br>Line 1783: Key : sta.scan_method<br>Line 1794: Key : sta.sort_method<br>Line 1805: Key : sta.minrssi<br>Line 1816: Key : sta.minauth<br>Line 1827: Key : sta.pmf_e<br>Line 1838: Key : sta.pmf_r<br>Line 1849: Key : sta.btm_e<br>Line 1860: Key : sta.rrm_e<br>Line 1871: Key : ap.ssid<br>Line 1887: Key : ap.ssid<br>Line 1901: Key : ap.passwd<br>Line 1919: Key : ap.passwd<br>Line 1933: Key : ap.pmk<br>Line 1948: Key : ap.pmk<br>Line 1962: Key : ap.chan<br>Line 1973: Key : ap.authmode<br>Line 1984: Key : ap.hidden<br>Line 1995: Key : ap.max.conn<br>Line 2006: Key : bcn.interval<br>Line 2017: Key : ap.phym<br>Line 2028: Key : ap.phybw<br>Line 2039: Key : ap.sndchan<br>Line 2050: Key : ap.pmf_e<br>Line 2061: Key : ap.pmf_r<br>Line 2072: Key : lorate<br>Line 2083: Key : country<br>Line 2097: Key : country<br>Line 2111: Key : opmode<br>Line 2121: Key : phy<br>Line 2132: Key : cal_data</td>
</tr></tbody></table><p id="bkmrk-as-you-can-see-there">As you can see there is a major difference! What stood out the most was a save key and the difference between the flags.</p>
<pre id="bkmrk-entry-34-bitmap-stat"><code class="language-">  Entry 34
  Bitmap State : Written
    Written Entry 34
      NS Index : 2
      Type : BLOB_DATA
      Span : 3
      ChunkIndex : 0
      Key : save
      Blob Data :
        Size : 36 
        Data :
00000000: 00 00 00 00 01 00 00 00  01 01 00 00 01 00 19 00  ................
00000010: 01 00 00 00 FF 00 FF 00  01 00 00 00 00 00 00 00  ................
00000020: 00 00 00 00                                       ....

  Entry 37
  Bitmap State : Empty
    Written Entry 37
      NS Index : 2
      Type : BLOB_IDX
      Span : 1
      ChunkIndex : 255
      Key : save
      Blob IDX :
        Size        : 36 
        Chunk Count : 0 
        Chunk Start  : 255 </code></pre>
<p id="bkmrk-now-i-was-also-able-">Now I was also able to obtain a firmware with 2 flags solved. And the solution because obvious as seen below.</p>
<p id="bkmrk--103"><a href="/uploads/images/gallery/2021-06/sdbre0PzMX4060G6-image-1623119149125.png" target="_blank" rel="noopener"><img src="/uploads/images/gallery/2021-06/scaled-1680-/sdbre0PzMX4060G6-image-1623119149125.png" alt="image-1623119149125.png"></a></p>
<p id="bkmrk-therefore-all-flags-">Therefore to get all of the 10 flags should be this bitmap state's data should be:</p>
<p id="bkmrk-00-00-00-00-01-00-00"><code>00 00 00 00 01 00 00 00 00 00 01 01 01 00 19 00 01 00 00 00 ff 00 ff 00 01 01 01 01 01 00 01 01 01 01 00 00</code></p>
<p id="bkmrk-so-lets-grab-that-co">So lets grab that copy of Erics's firmware, perform a NVS dumps, flipped the corresponding two bits and then write to flash.</p>
<p id="bkmrk--104"><a href="/uploads/images/gallery/2021-06/atyV10iLpcHThpVY-image-1623119446102.png" target="_blank" rel="noopener"><img src="/uploads/images/gallery/2021-06/scaled-1680-/atyV10iLpcHThpVY-image-1623119446102.png" alt="image-1623119446102.png"></a></p>
<p id="bkmrk-then-ill-open-this-i">Then ill open this in a hex editor and flip all those bits.</p>
<p id="bkmrk--105"><a href="/uploads/images/gallery/2021-06/60a3UbPPJp4etG7z-image-1623119933018.png" target="_blank" rel="noopener"><img src="/uploads/images/gallery/2021-06/scaled-1680-/60a3UbPPJp4etG7z-image-1623119933018.png" alt="image-1623119933018.png"></a></p>
<p id="bkmrk--106"><a href="/uploads/images/gallery/2021-06/LmQs4wsiAjKRY9fd-image-1623120058778.png" target="_blank" rel="noopener"><img src="/uploads/images/gallery/2021-06/scaled-1680-/LmQs4wsiAjKRY9fd-image-1623120058778.png" alt="image-1623120058778.png"></a></p>
<div data-list-item-id="chat-messages___chat-messages-850898395635777596" id="bkmrk-now-with-that-done-w">
<div data-list-item-id="chat-messages___chat-messages-850898395635777596">
<div data-list-item-id="chat-messages___chat-messages-850898395635777596">
<div>
<div aria-label="Message Actions">
<div>
<div aria-label="Add Reaction" aria-controls="popout_6957" aria-expanded="false">Now with that done we will write our new NVS to the flash of the badge and fucking pray to all gods that I don't destroy my badge.</div>
</div>
</div>
</div>
</div>
</div>
</div>
<p id="bkmrk--107"><a href="/uploads/images/gallery/2021-06/YczCw99Z3q3PaNr4-image-1623120556635.png" target="_blank" rel="noopener"><img src="/uploads/images/gallery/2021-06/scaled-1680-/YczCw99Z3q3PaNr4-image-1623120556635.png" alt="image-1623120556635.png"></a></p>
<p id="bkmrk--108"><iframe src="//www.youtube.com/embed/MykoU2Uot9A" width="560" height="314" allowfullscreen="allowfullscreen"></iframe></p>
<p id="bkmrk-holly-shit-we-did-it">Holly shit we did it!</p>
<p id="bkmrk--109"><a href="/uploads/images/gallery/2021-06/C2n2pCcHU82hZrYz-final-min.PNG" target="_blank" rel="noopener"><img src="/uploads/images/gallery/2021-06/scaled-1680-/C2n2pCcHU82hZrYz-final-min.PNG" alt="final-min.PNG"></a></p>
<h3 id="bkmrk-flag-%236-%2F-who%27s-knoc">Flag #6 / Who's Knocking?</h3>
<p id="bkmrk-due-to-flag-8-and-9-">This flag was literally hell. IT took me way to long to figure out what was going on. In case you don't know me that well I'm not great at WiFi pentests. I haven't done a lot of them and its not really an area that interests me. I don't have a WiFi card so the only way I could solve this challenge was by booting kali off of a USB. I spent roughly 3 solid days trying to make a workaround for my VM but VirtualBox simply cant do it.</p>
<p id="bkmrk-due-to-flag-8-and-9--0">Due to flag 8 and 9 (the reverse challenge) and having to connect to WiFi I knew there could be something funky going. My gut feeling was that I needed to capture some WiFi transmission. At first I thought that maybe the badge's interface is transmitting frames on lets say channel X and I just had to figure it out. When that was disprove I thought that maybe the badge had a secret SSID but that was also false. There were a lot of other theories that were tested and disproven.</p>
<p id="bkmrk-now-my-wifi-knowledg">This was clearly not one of my best moments, but it worked...</p>
<p id="bkmrk--110"><a href="/uploads/images/gallery/2021-06/CQQMgUGJYicm46ps-image1-min.PNG" target="_blank" rel="noopener"><img src="/uploads/images/gallery/2021-06/scaled-1680-/CQQMgUGJYicm46ps-image1-min.PNG" alt="image1-min.PNG"></a></p>
<p id="bkmrk-i-need-my-setup-to-b">I need my setup to be this way since I need to create a hotspot WiFi from the same WiFi connection but since I couldn't do that because I don't own a USB WiFi card I created a WiFi connection from my a wired connection. Thanks to a <a href="https://superuser.com/questions/1148858/how-to-create-an-access-point-from-the-current-wifi-connection"><span style="text-decoration: underline;">stack overflow</span></a> comment I discovered a tool called <span style="text-decoration: underline;"><a href="https://github.com/oblique/create_ap">create_ap</a></span> as seen below.</p>
<p id="bkmrk--111"><a href="/uploads/images/gallery/2021-06/2e85j8wqbchl9BkB-image-1623127990760.png" target="_blank" rel="noopener"><img src="/uploads/images/gallery/2021-06/scaled-1680-/2e85j8wqbchl9BkB-image-1623127990760.png" alt="image-1623127990760.png"></a></p>
<p id="bkmrk-this-created-a-ap0-i">This created a ap0 interface which was on 198.51.100.42 which is what I needed. With this I will be able to send all the traffic into wireshark and know that whatever the badge would send once it established a connection I would receive.</p>
<p id="bkmrk--112"><a href="/uploads/images/gallery/2021-06/jx3UTnk8NG56O5ND-image-1623128052202.png" target="_blank" rel="noopener"><img src="/uploads/images/gallery/2021-06/scaled-1680-/jx3UTnk8NG56O5ND-image-1623128052202.png" alt="image-1623128052202.png"></a></p>
<p id="bkmrk-then-i-used-the-badg">Then I used the badges CLI to join the AP I just created.</p>
<p id="bkmrk--113"><a href="/uploads/images/gallery/2021-06/x7NLEGsvb4YSEzoG-image-1623128099372.png" target="_blank" rel="noopener"><img src="/uploads/images/gallery/2021-06/scaled-1680-/x7NLEGsvb4YSEzoG-image-1623128099372.png" alt="image-1623128099372.png"></a></p>
<p id="bkmrk-and-out-of-the-short">And out of the short capture I noticed that once the badge authenticated to the IP</p>
<p id="bkmrk--114"><a href="/uploads/images/gallery/2021-06/3A6VsGSmI0oa92sO-image-1623128750865.png" target="_blank" rel="noopener"><img src="/uploads/images/gallery/2021-06/scaled-1680-/3A6VsGSmI0oa92sO-image-1623128750865.png" alt="image-1623128750865.png"></a></p>
<p id="bkmrk-i-would-see-that-the">I would see that the badge was trying to reach out to 198.51.100.172 on port 4444 and even if someone doesn't know whats going on and is drunk on whisky 4444 screams reverse shell.</p>
<p id="bkmrk--115"><a href="/uploads/images/gallery/2021-06/LScXRXQAj231tzbZ-image-1623128145759.png" target="_blank" rel="noopener"><img src="/uploads/images/gallery/2021-06/scaled-1680-/LScXRXQAj231tzbZ-image-1623128145759.png" alt="image-1623128145759.png"></a></p>
<p id="bkmrk-i-setup-a-netcat-lis">I setup a netcat listener on my localhost and sure enough after a few seconds I caught the connection</p>
<p id="bkmrk--116"><a href="/uploads/images/gallery/2021-06/B4avV7adf2IiNe1a-image-1623128072838.png" target="_blank" rel="noopener"><img src="/uploads/images/gallery/2021-06/scaled-1680-/B4avV7adf2IiNe1a-image-1623128072838.png" alt="image-1623128072838.png"></a></p>
<p id="bkmrk-our-final-flag-of-th">Our final flag of the journey is <code>FLAG-spOkeTh3Hors</code></p>
<p id="bkmrk--117"><a href="/uploads/images/gallery/2021-06/UXgZ0eEE2j0uerIU-image-1623129055086.png" target="_blank" rel="noopener"><img src="/uploads/images/gallery/2021-06/scaled-1680-/UXgZ0eEE2j0uerIU-image-1623129055086.png" alt="image-1623129055086.png"></a></p>
<p id="bkmrk-%C2%A0-3"> </p>
<p id="bkmrk-by%3A-boschko"><strong>By: Olivier (Boschko) Laflamme<br></strong></p>
<ul id="bkmrk-twitter%3A-https%3A%2F%2Ftwi"><li>Twitter: <a href="https://twitter.com/olivier_boschko">https://twitter.com/olivier_boschko</a></li>
<li>LinkedIn: <a href="https://www.linkedin.com/in/olivierlaflammelink/">https://www.linkedin.com/in/olivierlaflammelink/</a></li>
</ul><p id="bkmrk-%C2%A0-14"> </p>
