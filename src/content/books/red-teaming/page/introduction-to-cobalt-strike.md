---
title: "Introduction to Cobalt Strike"
slug: "introduction-to-cobalt-strike"
priority: 1
editor: "wysiwyg"
revisionCount: 6
id: 34
createdAt: "2020-05-07T16:07:45Z"
createdBy: "boschko"
updatedAt: "2020-05-26T14:11:07Z"
updatedBy: "boschko"
ownedBy: "boschko"
views: 17
---
<h3 id="bkmrk-0x01-what-is-cobalt-">0x01 What is Cobalt Strike</h3>
<p id="bkmrk-"><a href="/uploads/images/gallery/2020-05/al61EewzgdEXrD2R-image-1588873127987.png" target="_blank" rel="noopener"><img class="align-center" src="/uploads/images/gallery/2020-05/scaled-1680-/al61EewzgdEXrD2R-image-1588873127987.png" alt="image-1588873127987.png"></a></p>
<h5 id="bkmrk-%22cobalt-strike-is-so" class="align-center">"Cobalt Strike is software for Adversary Simulations and Red Team Operation"</h5>
<p id="bkmrk-%C2%A0"> </p>
<p id="bkmrk-cobalt-strike-is-a-p">Cobalt Strike is a powerful platform for conducting offensive cyber operations. It contains a wide variety of tools for conducting spear phishing and web drive-by attacks to gain initial access. Through the artefact kit, Cobalt Strike also has a flexible obfuscation framework. However, it is in the arena of post-exploitation that Cobalt Strike really shines. It has a custom implant, called Beacon, which can handle command and control (C2) communications via HTTP(S), DNS and even SMB named pipes. Beacon has numerous options for lateral movement, e.g., WMI and psexec as well as the ability to load PowerShell and .Net assemblies for additional modules such as mimikatz.</p>
<p id="bkmrk-if-you-haven%E2%80%99t-used-" data-adtags-visited="true">If you haven’t used Cobalt Strike before, Im going to presume that you haven't go a full licensed copy. A trial copy can be requested at the following URL: <a href="https://trial.cobaltstrike.com/"><code>https://trial.cobaltstrike.com/</code>.</a> Installation and setup can be found here: <a href="https://www.cobaltstrike.com/support"><code>https://www.cobaltstrike.com/support</code>  </a>Once you have your trial copy downloaded and pre-requisites installed you can begin.</p>
<h3 id="bkmrk-0x02-basics-and-term" data-adtags-visited="true">0x02 Basics and Terminology</h3>
<p id="bkmrk-cobalt-strike-comes-">Cobalt Strike comes in a package that consists of a <code>client</code> and <code>server</code> files. The server is refereed to as  the <code>team server</code>. The following are the files that you’ll get once you download the package.</p>
<p id="bkmrk--0"><a href="/uploads/images/gallery/2020-05/ZTPJTfuPizyUUIpj-image-1588873483630.png" target="_blank" rel="noopener"><img class="align-center" src="/uploads/images/gallery/2020-05/scaled-1680-/ZTPJTfuPizyUUIpj-image-1588873483630.png" alt="image-1588873483630.png"></a></p>
<p id="bkmrk-cobalt-strike-works-">Cobalt Strike works on a client-server model in which the red-teamer connects to the team server via the Cobalt Strike client. All the connections (bind/reverse) to/from the victims are managed by the team server.</p>
<h5 id="bkmrk-what-is-the-team-ser">What is the team server?</h5>
<ul id="bkmrk-it-is-the-controller"><li>It is the controller for the Beacon payloads</li>
<li>It is the host for Cobalt Strikes social engineering features</li>
<li>The team server manages data collected by Cobalt Strike and manages logging</li>
<li>It collects all the credentials that are discovered in the post-exploitation phase or used by the attacker on the target systems to log in.</li>
</ul><p id="bkmrk-it-is-a-simple-bash-">It is a simple bash script that calls for the Metasploit RPC service (msfrpcd) and starts the server with cobaltstrike.jar. This script can be customized according to the needs of the individual.</p>
<p id="bkmrk-note%3A-it-should-be-s">Note: It should be said that when starting your team server you can specify a kill date in (YYYY-MM-DD) in doing this the team server will embed this kill date into each Beacon stage it generates. This is useful as it prevents you from having to inform a client that they have to go around their system deleting sleeping Cobalt Strike beacons.</p>
<h5 id="bkmrk-what-is-a-beacon%3F">What is a Beacon?</h5>
<p id="bkmrk-a-beacon-is-a-malici">A Beacon is <span class="text-4505230f--TextH400-3033861f--textContentFamily-49a318e1"><span data-key="cd1481fd54824c26bafc9a0532bf536e">a malicious agent / implant on a compromised system that calls back to the attacker controlled system and checks for any new commands that should be executed on the compromised system. <br></span></span></p>
<p id="bkmrk-you-essentially-cont"><span class="text-4505230f--TextH400-3033861f--textContentFamily-49a318e1"><span data-key="cd1481fd54824c26bafc9a0532bf536e">You essentially control your target’s network with Cobalt Strike’s Beacon's. </span></span></p>
<p id="bkmrk-beacon-can-walk-thro"><span class="text-4505230f--TextH400-3033861f--textContentFamily-49a318e1"><span data-key="cd1481fd54824c26bafc9a0532bf536e">Beacon can walk through common proxy configurations and calls home to multiple hosts to resist blocking. You can also reprogram Beacon's to use targets network indicators to blend in within existing network traffic.<br></span></span></p>
<h5 id="bkmrk-what-is-a-listener%3F">What is a Listener?</h5>
<p id="bkmrk-listeners-are-servic">Listeners are services running on the attackers C2 server that is listening for beacon callbacks. That are essentially configured information for a payload and a directive for Cobalt Strike to stand up a server to receive connections from that payload.</p>
<p id="bkmrk-they-consist-of-a-us">They consist of a user-defined name, the type of payload, and several payload-specific options.</p>
<h3 id="bkmrk-0x03-getting-started" data-adtags-visited="true">0x03 Getting Started</h3>
<h5 id="bkmrk-starting-the-team-se">Starting the team server:</h5>
<p id="bkmrk-to-start-the-team-se">To start the team server you need two arguments. The <strong>first</strong> is the host (your IP or a IP that is reachable from the internet) note that if you are behind a home router you can port forward the listeners port on the router itself. The <strong>second </strong>is the password which will be used by the team server for authentication. </p>
<p id="bkmrk--1"><a href="/uploads/images/gallery/2020-05/b4MH5LGHPkoJfr3a-image-1588875547348.png" target="_blank" rel="noopener"><img src="/uploads/images/gallery/2020-05/scaled-1680-/b4MH5LGHPkoJfr3a-image-1588875547348.png" alt="image-1588875547348.png"></a></p>
<p id="bkmrk-now-we-can-go-ahead-">Now we can go ahead and start the Cobalt Strike client.</p>
<p id="bkmrk--2"><a href="/uploads/images/gallery/2020-05/QJMTa6XdngaGOMI5-image-1588875827177.png" target="_blank" rel="noopener"><img class="align-center" src="/uploads/images/gallery/2020-05/scaled-1680-/QJMTa6XdngaGOMI5-image-1588875827177.png" alt="image-1588875827177.png"></a></p>
<ul id="bkmrk-the-host-is-the-team"><li>The host is the team server IP or DNS name</li>
<li>The user is anything you like</li>
<li>The password is the password of the team server</li>
</ul><p id="bkmrk-once-you-hit-connect">Once you hit connect you will be greeted with the user interface of Cobalt Strike.</p>
<p id="bkmrk--3"><a href="/uploads/images/gallery/2020-05/Md62l9s0ZJ11Bak5-image-1588876371516.png" target="_blank" rel="noopener"><img src="/uploads/images/gallery/2020-05/scaled-1680-/Md62l9s0ZJ11Bak5-image-1588876371516.png" alt="image-1588876371516.png"></a></p>
<p id="bkmrk-the-virtualization-z">The Virtualization zone is where the sessions and targets are displayed. It helps to better understand the network of a compromised host. The Display tabs is where you'll manage Cobalt Strike features and sessions for interaction.</p>
<p id="bkmrk-below-is-an-image-wh">Below is an image which gives us a quick breakdown of the toolbar icons:</p>
<p id="bkmrk--4"><a href="/uploads/images/gallery/2020-05/nSp1zrV30K7B0T0a-image-1588876244719.png" target="_blank" rel="noopener"><img class="align-center" src="/uploads/images/gallery/2020-05/scaled-1680-/nSp1zrV30K7B0T0a-image-1588876244719.png" alt="image-1588876244719.png"></a></p>
<p id="bkmrk-so-lets-setup-a-list">So lets setup a listener by first clicking on the headphone icon which will spawn a tab in the Display Tab portion of the user interface. Then click Add to add a new listener. You can name your listener whatever you want. Configurations as seen below:</p>
<p id="bkmrk--5"><a href="/uploads/images/gallery/2020-05/h32MQJK7US5KAtnH-image-1588877642142.png" target="_blank" rel="noopener"><img src="/uploads/images/gallery/2020-05/scaled-1680-/h32MQJK7US5KAtnH-image-1588877642142.png" alt="image-1588877642142.png"></a></p>
<p id="bkmrk-now-with-out-new-lis">Now with out new listener created and listening for a beacon callback we will go ahead and generate a stageless payload (remember payloads are called beacons). Follow the numbered steps as illustrated below.</p>
<p id="bkmrk--6"><a href="/uploads/images/gallery/2020-05/hJfnSlUDyJXe8Jvb-image-1588877926882.png" target="_blank" rel="noopener"><img src="/uploads/images/gallery/2020-05/scaled-1680-/hJfnSlUDyJXe8Jvb-image-1588877926882.png" alt="image-1588877926882.png"></a></p>
<p id="bkmrk-then-click-generate%2C">Then click generate, and if everything goes well you'll get a pop-up that the beacon has been successfully created.</p>
<p id="bkmrk--7"><a href="/uploads/images/gallery/2020-05/SQnstZlIXRQbGRvo-image-1588877970474.png" target="_blank" rel="noopener"><img class="align-center" src="/uploads/images/gallery/2020-05/scaled-1680-/SQnstZlIXRQbGRvo-image-1588877970474.png" alt="image-1588877970474.png"></a></p>
<p id="bkmrk-now-all-that-is-left">Now all that is left to do is to generate the previously generated bacon. In doing so the Cobalt Strike client which is connected to the team server will catch the beacon callback.</p>
<p id="bkmrk--9"><a href="/uploads/images/gallery/2020-05/E4f4qvl8JY30UWuz-image-1588878351299.png" target="_blank" rel="noopener"><img src="/uploads/images/gallery/2020-05/scaled-1680-/E4f4qvl8JY30UWuz-image-1588878351299.png" alt="image-1588878351299.png"></a></p>
<p id="bkmrk-as-you-can-see-the-b">As you can see the beacon was uploaded to a server and ran. As a result we obtained a callback which is visually reflected in the  Visualization zone of the user interface.</p>
<p id="bkmrk-we-can-also-obtain-c">We can also obtain callbacks via crafted payloads by going to Attacks -&gt; Packages -&gt; Payload Generator, then selecting the listener and Generating the payload. This will create a default file entitled payload.txt.</p>
<p id="bkmrk--8"><a href="/uploads/images/gallery/2020-05/k51DtUt7t3RWw0gI-image-1588884529739.png" target="_blank" rel="noopener"><img class="align-center" src="/uploads/images/gallery/2020-05/scaled-1680-/k51DtUt7t3RWw0gI-image-1588884529739.png" alt="image-1588884529739.png"></a></p>
<p id="bkmrk--10"><a href="/uploads/images/gallery/2020-05/6Cxezt3O2mZW1y3n-image-1588884648360.png" target="_blank" rel="noopener"><img class="align-center" src="/uploads/images/gallery/2020-05/scaled-1680-/6Cxezt3O2mZW1y3n-image-1588884648360.png" alt="image-1588884648360.png"></a></p>
<p id="bkmrk-and-once-ran-on-the-">And once ran on the target, as shown in the image below we obtain a second "session" on the target. This method is useful when trying to bypass AV with properly obfuscated shells.</p>
<p id="bkmrk--11"><a href="/uploads/images/gallery/2020-05/1gYDoP7q3yZUEr7a-image-1588884788334.png" target="_blank" rel="noopener"><img src="/uploads/images/gallery/2020-05/scaled-1680-/1gYDoP7q3yZUEr7a-image-1588884788334.png" alt="image-1588884788334.png"></a></p>
<p id="bkmrk-%C2%A0-5">Now to interact with the beacon, right click the beacon and select interact. Note that the new tab opening in the Display zone will appear. This is what allows us, the attacker to issue commands to the beacon. (These are only extremely basic)</p>
<pre id="bkmrk-%23-list-the-file-on-t"><code class="language-"># List the file on the specified directory
beacon &gt; ls &lt;C:\Path&gt;

# Change into the specified working directory
beacon &gt; cd [directory]

# Delete a file\folder
beacon &gt; rm [file\folder]

# File copy
beacon &gt; cp [src] [dest]

# Download a file from the path on the Beacon host
beacon &gt; download [C:\filePath]

# Lists downloads in progress
beacon &gt; downloads

# Cancel a download currently in progress
beacon &gt; cancel [*file*]

# Upload a file from the attacker to the current Beacon host
beacon &gt; upload [/path/to/file]</code></pre>
<p id="bkmrk-shell-dir-this-will-"><code>shell dir</code> This will spawn a cmd.exe process, execute the command, and relay the output back to you. If you’d like to change the directory, don’t use shell cd. This will change the directory in the cmd.exe that gets spawned.</p>
<p id="bkmrk--12"><a href="/uploads/images/gallery/2020-05/NgAPRGMH3xqFWPSm-image-1588885125054.png" target="_blank" rel="noopener"><img src="/uploads/images/gallery/2020-05/scaled-1680-/NgAPRGMH3xqFWPSm-image-1588885125054.png" alt="image-1588885125054.png"></a></p>
<p id="bkmrk-%C2%A0-6">Now really the possibilities are endless... we can start doing local privilege escalation:</p>
<pre id="bkmrk-powershell-get-itemp"><code class="language-powershell">powershell Get-ItemProperty HKLM:\SOFTWARE\Microsoft\Windows\CurrentVersion\Policies\System</code></pre>
<p id="bkmrk--13"><a href="/uploads/images/gallery/2020-05/PDqFs8BKYthBxEv5-image-1588885860494.png" target="_blank" rel="noopener"><img src="/uploads/images/gallery/2020-05/scaled-1680-/PDqFs8BKYthBxEv5-image-1588885860494.png" alt="image-1588885860494.png"></a></p>
<pre id="bkmrk-consentpromptbehavio"><code class="language-">ConsentPromptBehaviorAdmin  : 5  ---&gt;  This option prompts the Consent Admin to enter his or her user name and password (or another valid admin) when an operation requires elevation of privilege. This operation occurs on the secure desktop.
ConsentPromptBehaviorUser   : 3  ---&gt;  This option SHOULD be set to ensure that a standard user that needs to perform an operation that requires elevation of privilege will be prompted for an administrative user name and password. If the user enters valid credentials, the operation will continue with the applicable privilege.
EnableLUA                   : 1  ---&gt;  This policy enables the "administrator in Admin Approval Mode" user type while also enabling all other User Account Control (UAC) policies.
PromptOnSecureDesktop       : 1  ---&gt;  This policy will force all UAC prompts to happen on the user's secure desktop.</code></pre>
<p id="bkmrk-%C2%A0-9">At this point really you should go ahead and import PowerView into the CobaltStrike beacon and run Add-DomainObjectAcl for all rights on xxx.local. Maybe even do some <code>powershell Invoke-UserHunter</code> get a user then <code>make_token</code> and then go for some sexy <code>krbtgt</code> to get DA.</p>
<p id="bkmrk-%C2%A0-0"> </p>
<p id="bkmrk-this-is-all-for-now.">This is all for now. In other page we'll go more in depth, looking at modules creating malleable c2's, custom payloads, Metasploit compatibility, more Beacons such as SMB, and so on...</p>
<h3 id="bkmrk-stay-tuned%21">Stay Tuned!</h3>
<p id="bkmrk-%C2%A0-1"> </p>
<p id="bkmrk-references%3A">References:</p>
<ul id="bkmrk-https%3A%2F%2Fwww.cobaltst"><li><a href="https://www.cobaltstrike.com/downloads/csmanual40.pdf">https://www.cobaltstrike.com/downloads/csmanual40.pdf</a></li>
<li><a href="https://www.cobaltstrike.com/help-beacon">https://www.cobaltstrike.com/help-beacon</a></li>
</ul><hr id="bkmrk--14"><h4 id="bkmrk-by-boschko">By Boschko</h4>
<ul id="bkmrk-my-hack-the-box%3A-htt"><li class="graf graf--p">My Hack The Box: <a class="markup--anchor markup--p-anchor" href="https://www.hackthebox.eu/home/users/profile/37879" target="_blank" rel="nofollow noopener" data-href="https://www.hackthebox.eu/home/users/profile/37879">https://www.hackthebox.eu/home/users/profile/37879</a></li>
<li class="graf graf--p">My Website: <a class="markup--anchor markup--p-anchor" href="https://olivierlaflamme.github.io/" target="_blank" rel="noopener nofollow noopener" data-href="https://olivierlaflamme.github.io/">https://olivierlaflamme.github.io/</a></li>
<li class="graf graf--p">My GitHub: <a class="markup--anchor markup--p-anchor" href="https://github.com/OlivierLaflamme" target="_blank" rel="noopener nofollow noopener" data-href="https://github.com/OlivierLaflamme">https://github.com/OlivierLaflamme</a></li>
<li class="graf graf--p">My WeChat QR below:</li>
</ul><figure id="bkmrk--15" class="graf graf--figure graf--layoutOutsetLeft"><img class="graf-image" src="https://cdn-images-1.medium.com/max/750/0*Jh0zrZrfyn8WjkDn.png" data-image-id="0*Jh0zrZrfyn8WjkDn.png" data-width="142" data-height="144"></figure><div id="bkmrk--16">
<div>
<div></div>
</div>
</div>
<p id="bkmrk-%C2%A0-12"> </p>
