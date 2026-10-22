---
title: "Cobalt Strike Process Injection"
slug: "cobalt-strike-process-injection"
priority: 2
editor: "wysiwyg"
revisionCount: 3
id: 35
createdAt: "2020-05-07T16:10:12Z"
createdBy: "boschko"
updatedAt: "2021-11-02T22:28:42Z"
updatedBy: "boschko"
ownedBy: "boschko"
views: 11
---
<h3 id="bkmrk-0x01-intro">0x01 Intro</h3>
<p id="bkmrk-here-are-my-thoughts">Here are my thoughts on process injection and share some technical details about Cobalt Strike's process injection, as well as some of the red team attack techniques you may want to know.</p>
<p id="bkmrk-%C2%A0"> </p>
<h3 id="bkmrk-0x02-injection-funct">0x02 Injection Function</h3>
<p id="bkmrk-cobalt-strike-curren">Cobalt Strike currently provides process injection functions in some scenarios. The most common is to directly inject payload into a new process. This function can be executed through various sessions that you have obtained, such as <a href="https://www.cobaltstrike.com/help-artifact-kit" target="_blank" rel="noopener">Artifact Kit</a> , <a href="https://www.youtube.com/watch?v=QvQerXsPSvc" target="_blank" rel="noopener">Applet Kit</a> and <a href="https://www.cobaltstrike.com/help-resource-kit" target="_blank" rel="noopener">Resource Kit</a> . This article will focus on Cobalt Strike's process injection in Beacon sessions.</p>
<p id="bkmrk-the-shinject-command">The <code>shinject</code> command injects code into any remote process, some built-in <em>post-exploitation</em> modules can also be injected to a particular remote process through the tool. Cobalt Strike did this because injecting shellocde into a new session would be safer than migrating the session directly to another C2.</p>
<p id="bkmrk-%28probably-the-reason">(Probably the reason is that if the new session is not pulled up, it will be embarrassing if the original session has dropped.)</p>
<p id="bkmrk-therefore%2C-cobalt-st">Therefore, Cobalt Strike <em>post-exploitation</em> will start a temporary process when it is executed, and inject the DLL file corresponding to the payload into the process, and confirm the result of the injection by retrieving the named pipe. Of course, this is just a special case of process injection. In this way, we can safely operate the main thread of these temporary processes without worrying about operation errors that cause the program to crash and result in loss of permissions. This is a very important detail to understand when learning to use Cobalt Strike injection process.</p>
<p id="bkmrk-the-first-parameter-">The first parameter of the inject command mentioned in the original text is the PID of the target program to be injected, and the second parameter is the architecture of the target program. If not filled, the default is x86.</p>
<pre id="bkmrk-inject-5732-x64"><code class="language-">inject 5732 x64</code></pre>
<p id="bkmrk-"><a href="/uploads/images/gallery/2020-05/HnRmX2X2r5RVceij-image-1588868420976.png" target="_blank" rel="noopener"><img src="/uploads/images/gallery/2020-05/scaled-1680-/HnRmX2X2r5RVceij-image-1588868420976.png" alt="image-1588868420976.png"></a></p>
<p id="bkmrk--0"><a href="/uploads/images/gallery/2021-11/cD8Z0sViOSBJWeDA-image-1635892032973.png" target="_blank" rel="noopener"><img src="/uploads/images/gallery/2021-11/scaled-1680-/cD8Z0sViOSBJWeDA-image-1635892032973.png" alt="image-1635892032973.png"></a></p>
<p id="bkmrk-the-parameter-writin">The parameter writing method of <code>shinject</code> is the same as that of inject. If the third parameter is not written, you will be prompted to select a shellcode file. Pay attention to the bin format payload that needs to be generated.</p>
<pre id="bkmrk-shinject-5732-x64-%2Fx"><code class="language-">shinject 5732 x64 /xxx.bin</code></pre>
<p id="bkmrk-%C2%A0-0"> </p>
<p id="bkmrk--1"><a href="/uploads/images/gallery/2021-11/F7NeF4pao1KDaRmc-image-1635892068097.png" target="_blank" rel="noopener"><img src="/uploads/images/gallery/2021-11/scaled-1680-/F7NeF4pao1KDaRmc-image-1635892068097.png" alt="image-1635892068097.png"></a></p>
<p id="bkmrk-in-addition-to-the-t">In addition to the two beacon commands mentioned in the original text, in fact, there is also a <code>shspawn</code>. Its role is to start a process and inject shellcode into it. The parameters only need to select the program architecture.</p>
<pre id="bkmrk-shspawn-x64-%2Fxxx.bin"><code class="language-">shspawn x64 /xxx.bin</code></pre>
<p id="bkmrk--2"><a href="/uploads/images/gallery/2021-11/ZRftRgdi9Wx2NuBM-image-1635892114966.png" target="_blank" rel="noopener"><img src="/uploads/images/gallery/2021-11/scaled-1680-/ZRftRgdi9Wx2NuBM-image-1635892114966.png" alt="image-1635892114966.png"></a></p>
<p id="bkmrk-as-shown-in-the-figu">As shown in the figure, the payload is injected into the rundll32.exe program. This method is much more stable than the first two, and you are not afraid of crashing the program.</p>
<p id="bkmrk-%C2%A0-1"> </p>
<h3 id="bkmrk-0x03-injection-proce">0x03 injection process</h3>
<p id="bkmrk-the%C2%A0process-inject%C2%A0b">The <code><a href="https://www.cobaltstrike.com/help-malleable-postex#processinject" target="_blank" rel="noopener">process-inject</a></code> block in Cobalt Strike's Malleable C2 configuration file is where the configuration process is injected:</p>
<pre id="bkmrk-process-inject-%7B-%23-s"><code class="language-C#">process-inject {
    # set remote memory allocation technique
    set allocator "NtMapViewOfSection";

    # shape the content and properties of what we will inject
    set min_alloc "16384";
    set userwx    "false";

    transform-x86 {
        prepend "\x90";
    }

    transform-x64 {
        prepend "\x90";
    }

    # specify how we execute code in the remote process
    execute {
        CreateThread "ntdll!RtlUserThreadStart";
        CreateThread;
        NtQueueApcThread-s;
        CreateRemoteThread;
        RtlCreateUserThread;
    }
}</code></pre>
<p id="bkmrk-the-execution-flow-o">The execution flow of this code is roughly as follows:</p>
<ol id="bkmrk-open-the-handle-of-t"><li>Open the handle of the remote process.</li>
<li>Allocate memory in remote processes.</li>
<li>Copy the shellcode to the remote process.</li>
<li>Execute shellcode in the remote process.</li>
</ol><h4 id="bkmrk-step-1%3A-distribute-a">Step 1: Distribute and copy data to the remote host</h4>
<p id="bkmrk-the-first-step-exist">The first step exists but daily development does not pay much attention. If we start a temporary process (such as a call <em>post-exploitation</em>); that is, we already have a handle to the remote process, at this time if we want to inject the code into the existing remote process ... [manual dog head], Cobalt Strike will use <a href="https://docs.microsoft.com/en-us/windows/win32/api/processthreadsapi/nf-processthreadsapi-openprocess" target="_blank" rel="noopener">OpenProcess</a> to solve this problem.</p>
<h4 id="bkmrk-step-2-3">Step 2-3</h4>
<p id="bkmrk-cobalt-strike-provid">Cobalt Strike provides two options for allocating memory and copying data into remote processes.</p>
<p id="bkmrk-the-first-solution-i">The first solution is the classic- <code>VirtualAllocEx&gt; WriteProcessMemorypattern</code>, which is very common in attack tools. It is worth mentioning that this solution is also applicable to different process architectures, and the application of process injection is not limited to the injection of x64 target processes. This means that a good solution needs to take into account the different extreme situations that occur (for example, x86-&gt; x64, or x64-&gt; x86, etc.). This makes it <code>VirtualAllocEx</code> a relatively reliable choice, and Cobalt Strike's default solution is also his. If you want to directly specify this mode, you can set <code>process-inject</code> the -&gt; <code>allocator </code>option <code>VirtualAllocEx</code> to.</p>
<p id="bkmrk-the-second-solution-">The second solution provided by Cobalt Strike is <code>CreateFileMapping</code> -&gt; <code>MapViewOfFile</code> -&gt; <code>NtMapViewOfSection</code> mode. This solution will first create a mapping file that supports the Windows system, and then map the view of the mapping file to the current process. Then Cobalt Strike will copy the injected data to the memory associated with the view and <code>NtMapViewOfSection</code> call our remote process. The same mapping file available in. To use this scheme <code>process-inject</code> -&gt; <code>allocator</code> set <code>NtMapViewOfSection</code> to the disadvantage of this scheme is only for <code>x86</code> -&gt; <code>x86</code> and <code>x64</code> -&gt; <code>x64</code>, related to the cross-architecture injection when Cobalt Strike will automatically switch back to <code>VirtualAllocEx</code> mode. </p>
<p id="bkmrk-when-virtualallocex-">When <code>VirtualAllocEx</code> &gt; <code>WriteProcessMemory</code> mode injection is subject to anti-soft defense? It is also a good choice to try this scheme instead. (It is very useful when killing software without detecting other methods of copying data to a remote process.)</p>
<h4 id="bkmrk-data-conversion">Data conversion</h4>
<p id="bkmrk-the-steps-2-and-3-me">The steps 2 and 3 mentioned above assume that everything is normal and the original data is copied to the injected data, which is almost impossible in the real environment. To this end, Cobalt Strike's process-inject adds the function of transforming and injecting data. The <code>min_alloc</code> option is the minimum size of the block that Beacon will allocate in the remote process, <code>startrwx</code> and the <code>userwx</code> option is the initial Boolean value of the allocated memory and the final permission of the allocated memory. If you want to prohibit data from being readable, writable, and executable (<code>RWX</code>), please set these values ​​to <code>false</code>. <code>transform-x86</code> and those that <code>transform-x64</code> support converting data to another architecture. If you need to add data in advance, make sure it is executable code for the corresponding architecture.</p>
<p id="bkmrk-note%2C-many-content-s">Note, many content signatures look for specific bytes at a fixed offset at the beginning of the observable boundary. These checks occur in O (1) time, which is conducive to O (n) search. Excessive Inspection and security technology may consume a lot of memory, and performance will be reduced accordingly.</p>
<p id="bkmrk-binary-padding%C2%A0also-"><a href="https://attack.mitre.org/techniques/T1009/" target="_blank" rel="noopener">Binary padding</a> also affects <code>post-exploitation</code> the thread start address offset in Cobalt Strike. When Beacon injects a DLL into memory; its <code>ReflectiveLoader</code> starts the thread at the position where the function exported by the DLL should be. This offset is shown in the thread start address feature, and is looking for a specific <em>post-exploitation DLL</em> of <a href="https://medium.com/@olafhartong/cobalt-strike-remote-threads-detection-206372d11d0f" target="_blank" rel="noopener">potential indicators</a>. The data before injection into the DLL will affect this offset. (It ’s okay not to know about thread related things, I will talk about it next ...)</p>
<h4 id="bkmrk-step-4%3A-code-executi">Step 4: code execution</h4>
<p id="bkmrk-let%27s-take-a-look-at">Let's take a look at the subtle differences between different execution methods in Beacon:</p>
<h4 id="bkmrk-createthread">CreateThread</h4>
<p id="bkmrk-createthread-from-th"><code>CreateThread</code> from the beginning. I think that <code>CreateThread</code> if it exists,  should first appear in an execution block, this function only runs when it is limited to self-injection. Using <code>CreateThread</code> will start a thread pointing to the code you want your Beacon to run. But be careful, when you self-inject in this way, the thread you pull will have a starting address, which is not related to the module (by module I mean DLL / current program itself) loaded into the current process space. For this you can specify <code>CreateThread“module！somefunction + 0x ##”</code>. This variant will generate a suspended thread that points to the specified function, if the specified function cannot be <code>GetProcAddressobtained</code> this is because Beacon will use to <code>SetThreadContextupdate</code> and will use this new thread to run the injected code, which is also a self-injection method that can provide you with a more favorable foothold.</p>
<h4 id="bkmrk-setthreadcontext">SetThreadContext</h4>
<p id="bkmrk-next-is%C2%A0setthreadcon">Next is <code>SetThreadContext</code>, which is used in post-exploitation. One of the main thread method interim process tasks generated. The Beacon is <code>SetThreadContext</code> suitable for x86 -&gt; x86, x64 -&gt; x64 and x64-&gt; x86. If you choose to use it <code>SetThreadContext</code>, place it in <code>CreateThread</code> after the option in the execution block. <code>SetThreadContext</code> when used; your thread will have a starting address that reflects the original execution entry point of the temporary process which is very nice.</p>
<h4 id="bkmrk-ntqueueapcthread-s">NtQueueApcThread-s</h4>
<p id="bkmrk-another-way-to-suspe">Another way to suspend a process is to use it <code>NtQueueApcThread-s</code>. This method uses <code>NtQueueApcThread</code> which is a one-time function to queue up when the target thread wakes up next time. In this case, the target thread is the main thread of the temporary process. The next step is to call <code>ResumeThread</code>, this function wakes up the main thread of our suspended process, because the process has been suspended at this time, we do not have to worry about returning this main thread to the process. This method only applies to x86 -&gt; x86 and x64 -&gt; x64.</p>
<p id="bkmrk-determining-wheather">Determining wheather to use  <code>SetThreadContext</code> or <code>NtQueueApcThread-s</code> depends on you. In most cases I think the latter is obviously more convenient.</p>
<h4 id="bkmrk-ntqueueapcthread">NtQueueApcThread</h4>
<p id="bkmrk-another-approach-is-">Another approach is through <code>NtQueueApcThread</code> it is like <code>NtQueueApcThread-sun</code> but it targets existing remote processes. This method needs to push the RWX stub to the remote process. This stub contains the code related to the injection. To execute the stub, you need to add the stub to the APC queue of each thread in the remote process. The stub code will be executed.</p>
<p id="bkmrk-so-what-is-the-role-">So what is the role of stubs?</p>
<p id="bkmrk-first%2C-the-stub-chec">First, the stub checks whether it is already running, and if it is, it executes nothing, preventing the injected code from running multiple times.</p>
<p id="bkmrk-then-the-stub-will-b">Then the stub will be called with the code and its parameters we injected <code>CreateThread</code>. This is done to let APC return quickly and let the original thread continue to work.</p>
<p id="bkmrk-no-thread-will-wake-">No thread will wake up and execute our stub. Beacon will wait about 200ms to start and check the stub to determine whether the code is still running. If not, update the stub and mark the injection as already running, and continue to the next item. This It is <code>NtQueueApcThread</code> the implementation details of the technology.</p>
<p id="bkmrk-at-present%2C-i-have-u">At present, I have used this method a few times, because some security products have very little attention to this incident. In other words, OPSEC has paid attention to it, and it is indeed a memory indicator that promotes RWX stubs. It will also call the code of the remote process that we push <code>CreateThread</code>. The starting address of the thread does not support the module on the disk. Use <code>Get-InjectedThread</code> scan not effectively. If you think this injection method is valuable, please continue to use it. Pay attention to weighing its pros and cons. It is worth mentioning that this method is limited to x86 -&gt; x86 and x64 -&gt; x64.</p>
<h4 id="bkmrk-createremotethread">CreateRemoteThread</h4>
<p id="bkmrk-another-way-is-via-c">Another way is via <code>CreateRemoteThread</code> which can be used literally as a remote injection technology. Starting with Windows Vista, injecting code across session boundaries will fail. In Cobalt Strike, <code>vanilla CreateRemoteThreadcovers</code> x86 -&gt; x86, x64 -&gt; x64 and x64 -&gt; x86. The movement of this technology is also obvious. When this method is used to create a thread in another process, it will trigger event 8 of the system monitoring tool Sysmon. Such, Beacon has indeed implemented a <code>CreateRemoteThread</code> variant that <code>“module！function + 0x ##”</code> accepts a pseudo start address in the form CreateThreadSimilarly, Beacon will create its thread in the suspended state and use <code>SetThreadContext / ResumeThread</code> enable to execute our code. This variant is limited to x86 -&gt; x86 and x64 -&gt; x64. If the <code>GetProcAddress</code> specified function cannot be used, this variant will also fail.</p>
<h4 id="bkmrk-rtlcreateuserthread">RtlCreateUserThread</h4>
<p id="bkmrk-the-last-way-cobalt-">The last way Cobalt Strike executes blocks is <code>RtlCreateUserThread</code>. This way <code>CreateRemoteThread</code> functions is very enjoyable but has some limitations, it is not perfect and has flaws.</p>
<p id="bkmrk-rtlcreateuserthread-"><code>RtlCreateUserThread</code> code will be injected across the session boundary. It is said that there will be many problems during the injection on Windows XP. This method will also trigger event 8 of the system monitoring tool Sysmon. One benefit is that it covers x86-&gt; x86, x64-&gt; x64, x64-&gt; x86, and x86-&gt; x64, the last case is very important.</p>
<p id="bkmrk-x86-%3E-x64-injection-">x86-&gt; x64 injection are in x86 Beacon session carried out. And for your <em>post-exploitation</em> generation process x64 tasks,<code> hashdump</code>, <code>mimikatz</code>, <code>execute-assembly</code> and <code>powerpick</code> modules are silent as x64. In order to achieve x86-&gt; x64 injection, this method converts the x86 process to x64 mode and injects RWX stubs to facilitate calling from x64 <code>RtlCreateUserThread</code>. This technique comes from Meterpreter. RWX stubs are a pretty good memory indicator. I have long suggested: "Let the process stay in x64 mode as much as possible", the above situation is why I would say this, and it is also recommended to put one in all. So <code>process-inject</code> is the lowest way to have it, you can use it when there is no other <code>work execute blockRtlCreateUserThread</code></p>
<h3 id="bkmrk-0x04-how-to-live-wit">0x04 How to live without process injection</h3>
<p id="bkmrk-when-i-was-thinking-">When I was thinking about how to use these attack techniques flexibly, I was also thinking what to do if none of these methods work?</p>
<p id="bkmrk-process-injection-is">Process injection is a technique to <code>transfer payload / capability to migrate</code> to different processes (such as from desktop session 0 to desktop session 1), you can use the runu command to transfer to different processes without process injection, and you can specify the bot program as you To run child processes of any process. This is a way to introduce a session to another desktop session without process injection.</p>
<p id="bkmrk-process-injection-is-0">Process injection is also one of the methods to execute code without landing files on the target. Many <em>post-exploitation</em> functions in Cobalt Strike can choose to attack specific processes. Specifying the current Beacon process can use them without remote injection. This is self-injection.</p>
<p id="bkmrk-of-course%2C-it-is-not">Of course, it is not perfect to execute code without a file on the ground. Sometimes it is best to put something on the disk. I have successfully compiled the keylogger tool into a DLL and put <code>c:\windows\linkinfo.dllit</code> into the <code>explorer.exeprocess</code> and loaded it into the process... We open sharing on the same system to share regularly captured key records, which helps me and my colleagues to operate under a highly censored situation. In this case, it is difficult to let the payload survive in the memory for a long time.</p>
<p id="bkmrk-%C2%A0-2"> </p>
<h5 id="bkmrk-references%3A">References:</h5>
<ul id="bkmrk-https%3A%2F%2Fblog.cobalts"><li><a href="https://blog.cobaltstrike.com/2019/08/21/cobalt-strikes-process-injection-the-details/">https://blog.cobaltstrike.com/2019/08/21/cobalt-strikes-process-injection-the-details/</a></li>
<li><a href="https://blog.cobaltstrike.com/2016/11/03/agentless-post-exploitation/">https://blog.cobaltstrike.com/2016/11/03/agentless-post-exploitation/</a></li>
<li><a href="https://blog.cobaltstrike.com/2018/04/23/fighting-the-toolset/">https://blog.cobaltstrike.com/2018/04/23/fighting-the-toolset/</a></li>
<li><a href="https://www.cobaltstrike.com/help-resource-kit">https://www.cobaltstrike.com/help-resource-kit</a></li>
<li><a href="https://www.cobaltstrike.com/help-artifact-kit">https://www.cobaltstrike.com/help-artifact-kit</a></li>
<li><a href="https://www.youtube.com/watch?v=QvQerXsPSvc">https://www.youtube.com/watch?v=QvQerXsPSvc</a></li>
</ul><p id="bkmrk-%C2%A0-3"> </p>
<p id="bkmrk-%C2%A0-4"> </p>
<hr id="bkmrk--3"><h4 id="bkmrk-by-boschko">By Boschko</h4>
<ul id="bkmrk-my-hack-the-box%3A-htt"><li class="graf graf--p">My Hack The Box: <a class="markup--anchor markup--p-anchor" href="https://www.hackthebox.eu/home/users/profile/37879" target="_blank" rel="nofollow noopener" data-href="https://www.hackthebox.eu/home/users/profile/37879">https://www.hackthebox.eu/home/users/profile/37879</a></li>
<li class="graf graf--p">My Website: <a class="markup--anchor markup--p-anchor" href="https://olivierlaflamme.github.io/" target="_blank" rel="noopener nofollow noopener" data-href="https://olivierlaflamme.github.io/">https://olivierlaflamme.github.io/</a></li>
<li class="graf graf--p">My GitHub: <a class="markup--anchor markup--p-anchor" href="https://github.com/OlivierLaflamme" target="_blank" rel="noopener nofollow noopener" data-href="https://github.com/OlivierLaflamme">https://github.com/OlivierLaflamme</a></li>
<li class="graf graf--p">My WeChat QR below:</li>
</ul><figure id="bkmrk--15" class="graf graf--figure graf--layoutOutsetLeft"><img class="graf-image" src="https://cdn-images-1.medium.com/max/750/0*Jh0zrZrfyn8WjkDn.png" data-image-id="0*Jh0zrZrfyn8WjkDn.png" data-width="142" data-height="144"></figure><p id="bkmrk-%C2%A0-6" class="graf graf--p graf--empty"> </p>
<p id="bkmrk-%C2%A0-5"> </p>
<p id="bkmrk-%C2%A0-7"> </p>
<p id="bkmrk-%C2%A0-8"> </p>
<p id="bkmrk-%C2%A0-9"> </p>
<p id="bkmrk-%C2%A0-10"> </p>
<p id="bkmrk-%C2%A0-11"> </p>
<p id="bkmrk-%C2%A0-12"> </p>
