---
title: "Windows thread control"
slug: "windows-thread-control"
priority: 6
editor: "wysiwyg"
revisionCount: 2
id: 51
createdAt: "2020-09-05T21:39:16Z"
createdBy: "boschko"
updatedAt: "2020-09-05T21:50:41Z"
updatedBy: "boschko"
ownedBy: "boschko"
views: 9
---
<p id="bkmrk-multithreading-undou">Multithreading undoubtedly brings a lot of convenience and improves a lot of development efficiency, but it also brings a lot of problems.</p>
<p id="bkmrk-example%3A">Example:</p>
<pre id="bkmrk-dword-winapi-threadp"><code class="language-C">DWORD WINAPI ThreadProc(LPVOID lPParameter); 

int m = 0 ;
int n = 0 ; 

int main( int argc, TCHAR* argv[], TCHAR* envp[])   
{ 
    HANDLE hThread = CreateThread(NULL, 0 ,(LPTHREAD_START_ROUTINE)ThreadProc ,NULL, 0 ,NULL); 
    int i = 0 ;
     for (i = 0 ; i&lt; 100000 ; i++ ) 
    { 
        m ++ ; 
        n ++ ; 
    } 
    Sleep( 1 );
    cout &lt;&lt; " M: " &lt;&lt;m&lt;&lt; endl; 
    cout &lt;&lt; " N: " &lt;&lt;n&lt;&lt; endl;     
    return  0 ; 
} 
DWORD WINAPI ThreadProc(LPVOID lPParameter) 
{ 
    int j = 0 ;
     for (j = 0 ;j&lt; 100000 ;j++ ) 
    { 
        m ++ ; 
        n ++ ; 
    } 
    return  0 ; 
}</code></pre>
<p id="bkmrk-what-is-the-output-o">What is the output of this program? According to common sense, it is not difficult to draw a conclusion: m and n are both 20000.</p>
<p id="bkmrk-but-what-about-the-r">But what about the real results?</p>
<p id="bkmrk-"><a href="/uploads/images/gallery/2020-09/JwLEabyNwjHOd2gB-image-1599342089812.png" target="_blank" rel="noopener"><img src="/uploads/images/gallery/2020-09/scaled-1680-/JwLEabyNwjHOd2gB-image-1599342089812.png" alt="image-1599342089812.png"></a></p>
<p id="bkmrk-the-results-are-surp">The results are surprising, and the results are different every time ! Why does this happen?</p>
<p id="bkmrk-when-a-thread-access">When A thread accesses global resources, it cannot control B thread's access to global resources. When A takes out the memory data and puts it in the register operation, B also takes out the memory data and put it in the register operation, which may cause repeated operations! That is to say, when A is performing calculations, B can perform calculations before putting the calculation results back. So the final result is smaller than 200,000 and m and n are different.</p>
<p id="bkmrk-in-order-to-control-">In order to control the thread not to be disordered, it must be coordinated according to our intention, and it is inevitable to use thread control (mutual exclusion/synchronization) technology!</p>
<p id="bkmrk-%C2%A0let-me-talk-about%C2%A0t"> Let me talk about the basic method of thread control :</p>
<p id="bkmrk-%C2%A01.-event-%28event%29"><span style="color: #cc99ff;"> 1. EVENT (event)</span></p>
<p id="bkmrk-%C2%A02.-critical-section"><span style="color: #cc99ff;"> 2. Critical Section (critical section)</span></p>
<p id="bkmrk-%C2%A03.-mutex-%28mutual-ex"><span style="color: #cc99ff;"> 3. Mutex (mutual exclusion)</span></p>
<p id="bkmrk-%C2%A04.-semaphore-%28semap"><span style="color: #cc99ff;"> 4. Semaphore (semaphore)</span></p>
<hr id="bkmrk--0"><p id="bkmrk-event-%28event%29"><span style="color: #cc99ff;">EVENT (event)</span></p>
<p id="bkmrk-using-events-to-sync">Using events to synchronize threads is the most flexible . An event has two states: excited state and unexcited state. Also called the signaled state and the non-signaled state . There are two types of events: manual reset events and automatic reset events. After the manual reset event is set to the activated state, all waiting threads will be awakened and remain in the activated state until the program resets it to the inactivated state. After the auto reset event is set to the activated state, it will wake up "a" waiting thread, and then automatically return to the inactivated state. So it is ideal to synchronize two threads with automatic reset events . The corresponding class in MFC is CEvent. The constructor of CEvent creates an automatically reset event by default, and it is in an unfired state. Change the state of the event: SetEvent, ResetEvent.</p>
<p id="bkmrk-%C2%A0let%27s-see-how-to-us"> Let's see how to use events to solve our actual problems:</p>
<pre id="bkmrk-dword-winapi-threadp-0"><code class="language-C">DWORD WINAPI ThreadProc(LPVOID lPParameter); 

int m = 0 ;
int n = 0 ; 

int main( int argc, TCHAR* argv[], TCHAR* envp[])   
{ 
    HANDLE hEvent = NULL; 
    hEvent = CreateEvent(NULL,FALSE, FALSE,NULL);   // FALSE ×Ô¶¯ TRUE ÊÖ¶¯ FALSEÊÇ×Ô¶¯     
    HANDLE hThread = CreateThread(NULL, 0 ,(LPTHREAD_START_ROUTINE)ThreadProc,hEvent, 0 ,NULL); 
    WaitForSingleObject(hEvent,INFINITE);   
    int i = 0 ;
     for (i=0 ;i&lt; 100000 ;i++ ) 
    { 
        m ++ ; 
        n ++ ; 
    } 
    Sleep( 1 ); 
    cout &lt;&lt; " M: " &lt;&lt;m&lt;&lt; endl; 
    cout &lt;&lt; " N: " &lt;&lt;n&lt;&lt; endl ;     
    return  0 ; 
} 

DWORD WINAPI ThreadProc(LPVOID lPParameter) 
{ 
    HANDLE hEvent = NULL; 
    hEvent = (HANDLE)lPParameter; 
    int j = 0 ;
    for (j= 0 ;j&lt; 100000 ;j++ ) 
    { 
        m ++ ; 
        n ++ ; 
    } 
    SetEvent(hEvent); 
    return  0 ; 
}</code></pre>
<p id="bkmrk-%C2%A0let%27s-see-if-the-re"> Let's see if the result is correct:</p>
<p id="bkmrk--1"><a href="/uploads/images/gallery/2020-09/iHGuNDZ0QLIH8Pth-image-1599342254468.png" target="_blank" rel="noopener"><img src="/uploads/images/gallery/2020-09/scaled-1680-/iHGuNDZ0QLIH8Pth-image-1599342254468.png" alt="image-1599342254468.png"></a></p>
<p id="bkmrk-they-are.">They are.</p>
<hr id="bkmrk--2"><p id="bkmrk-critical-section"><span style="color: #cc99ff;">Critical Section</span></p>
<p id="bkmrk-critical_section-is-">CRITICAL_SECTION is the fastest. Other kernel locks (events, mutexes) require thousands of CPU cycles each time they enter the kernel. The first advice for using critical regions is not to lock a resource for a long time.</p>
<p id="bkmrk-the-long-time-here-i">The long time here is relative and depends on different procedures. For some control software, it can be several milliseconds, but for other programs, it can be several minutes. But after entering the critical zone, you must leave as soon as possible to release resources. If it is not released, what will happen? The answer is nothing. If the main thread (GUI thread) wants to enter a critical area that has not been released, the program will hang! One disadvantage of the critical section is: Critical Section is not a core object , and it is impossible to know whether the thread entering the critical section is alive or dead. If the thread entering the critical section hangs, the critical resource is not released , the system cannot know, and there is no way to release the critical section. Resources.</p>
<p id="bkmrk-this-shortcoming-is-">This shortcoming is made up for in the mutex (Mutex).</p>
<pre id="bkmrk-dword-winapi-threadp-1"><code class="language-C">DWORD WINAPI ThreadProc(LPVOID lPParameter); 

int m = 0 ;
int n = 0 ; 

CRITICAL_SECTION cs;   
int main( int argc, TCHAR* argv[], TCHAR* envp[])   
{ 
    InitializeCriticalSection( &amp; cs);      
    HANDLE hThread = CreateThread (NULL, 0 ,(LPTHREAD_START_ROUTINE)ThreadProc,NULL, 0 ,NULL); 
    int i = 0 ; 
    EnterCriticalSection( &amp; cs);
     for (i = 0 ;i&lt; 100000 ;i++ )
    { 
        m ++ ; 
        n ++ ; 
    } 
    LeaveCriticalSection( &amp; cs); 
    Sleep( 1 ); 
    cout &lt;&lt; " M: " &lt;&lt;m&lt;&lt; endl; 
    cout &lt;&lt; " N: " &lt;&lt;n&lt;&lt; endl;     
    DeleteCriticalSection ( &amp;cs);   // Deadlock   
    return  0 ; 
} 
DWORD WINAPI ThreadProc(LPVOID lPParameter) 
{ 
    int j = 0 ; 
    EnterCriticalSection( &amp;cs);
     for (j = 0 ;j&lt; 100000 ;j++ ) 
    { 
        m ++ ; 
        n ++ ; 
    } 
    LeaveCriticalSection( &amp; cs); 
    return  0 ; 
}</code></pre>
<p id="bkmrk-the-same-way-you-can">The same way you can get the correct result!</p>
<p id="bkmrk-%C2%A0regarding-the-use-o">Regarding the use of the critical section, it is a four-step problem: initialize the critical section --&gt; enter the critical section --&gt; leave the critical section --&gt; destroy the critical section . Keep these four in mind and there will be no problems. One thing to note is: critical section and recursion should be used carefully, recursion in the critical section will cause deadlock!</p>
<hr id="bkmrk--3"><p id="bkmrk-%C2%A0mutex-%28mutual-exclu"><span style="color: #cc99ff;"> Mutex (mutual exclusion)</span></p>
<p id="bkmrk-the-function-of-the-">The function of the mutex is very similar to the critical region. The difference is: Mutex spends more time than Critical Section, but Mutex is the core object (Event, Semaphore also), can be used across processes, and waiting for a locked Mutex can be set to TIMEOUT, unlike the Critical Section In that way, it is impossible to know the situation of the critical region, and it keeps waiting. Win32 functions are: create a mutex CreateMutex(), open a mutex OpenMutex(), release a mutex ReleaseMutex(). </p>
<p id="bkmrk-the-ownership-of-mut">The ownership of Mutex does not belong to the thread that spawned it, but the last thread that waited for this Mutex (WaitForSingleObject, etc.) and has not yet performed the ReleaseMutex() operation. A thread owning a Mutex is like entering the Critical Section. Only one thread can own the Mutex at a time. </p>
<p id="bkmrk-if-a-thread-that-own">If a thread that owns a Mutex does not call ReleaseMutex() before returning, then the Mutex is discarded, but when other threads wait for this Mutex (WaitForSingleObject, etc.), they can still return and get a WAIT_ABANDONED_0 return value. It is unique to Mutex to be able to know that a Mutex is abandoned.</p>
<pre id="bkmrk-handle-hmutex-%3D-null"><code class="language-C">HANDLE hMutex = NULL; 
  
int main( int argc, TCHAR* argv[], TCHAR* envp[])   
{ 
    hMutex = CreateMutex(NULL,TRUE,NULL); 
    HANDLE hThread = CreateThread(NULL, 0 ,(LPTHREAD_START_ROUTINE)ThreadProc,NULL , 0 ,NULL); 
    int i = 0 ; 
    for (i = 0 ;i&lt; 100000 ;i++ ) 
    { 
        m ++ ; 
        n ++ ; 
    } 
    ReleaseMutex(hMutex);   
    Sleep( 1 ); 
    cout&lt;&lt; " M: " &lt;&lt;m&lt;&lt; endl; 
    cout &lt;&lt; " N: " &lt;&lt;n&lt;&lt; endl;     
    return  0 ; 
} 
DWORD WINAPI ThreadProc(LPVOID lPParameter) 
{ 
    WaitForSingleObject(hMutex,INFINITE); 
    int j = 0 ;
     for (j= 0 ;j&lt; 100000 ;j++ ) 
    { 
        m ++ ; 
        n ++ ; 
    } 
    return  0 ; 
}</code></pre>
<hr id="bkmrk--4"><p id="bkmrk-%C2%A0semaphore-%28semaphor"><span style="color: #cc99ff;"> Semaphore (semaphore)</span></p>
<p id="bkmrk-%C2%A0semaphore-is-the-mo">Semaphore is the most historical synchronization mechanism. Semaphore is a key element to solve the producer/consumer problem. The Win32 function CreateSemaphore() is used to generate a semaphore. ReleaseSemaphore() is used to release the lock. </p>
<p id="bkmrk-the-current-value-of">The current value of Semaphore represents the number of resources currently available. If the current value of Semaphore is 1, it means that there is another lock action that can succeed. If the current value is 5, it means there are five locking actions that can succeed. When calling Wait... and other functions to require locking, if the current value of Semaphore is not 0, Wait... returns immediately, and the number of resources is reduced by 1. When ReleaseSemaphore() is called, the number of resources is increased by 1, and it will not exceed the total number of resources initially set. </p>
<pre id="bkmrk-handle-hsemaphore-%3D-"><code class="language-C">HANDLE hSemaphore = NULL; 

int main( int argc, TCHAR* argv[], TCHAR* envp[])   
{ 
    hSemaphore = CreateSemaphore(NULL, 0 , 1 ,NULL); 
    HANDLE hThread = CreateThread(NULL, 0 ,(LPTHREAD_START_ROUTINE)ThreadProc ,NULL, 0 ,NULL); 
    int i = 0 ; 
    for (i = 0 ;i&lt; 100000 ;i++ ) 
    { 
        m ++ ; 
        n ++ ; 
    } 
    ReleaseSemaphore(hSemaphore, 1,NULL); 
    Sleep( 1 ); 
    cout &lt;&lt; " M: " &lt;&lt;m&lt;&lt; endl; 
    cout &lt;&lt; " N: " &lt;&lt;n&lt;&lt; endl;     
    CloseHandle(hSemaphore); 
    return  0 ; 
} 

DWORD WINAPI ThreadProc( LPVOID lPParameter) 
{ 
    WaitForSingleObject(hSemaphore,INFINITE); 
    int j = 0 ;
     for (j = 0 ;j&lt; 100000 ;j++ ) 
    { 
        m ++ ; 
        n ++ ;
    } 
    return  0 ; 
}</code></pre>
<p id="bkmrk-%C2%A0"> </p>
<h4 id="bkmrk-by-boschko">By Boschko</h4>
<div id="bkmrk-my-hack-the-box%3A-htt">
<div>
<ul id="bkmrk-my-hack-the-box%3A-htt-0"><li class="graf graf--p">My Hack The Box: <a class="markup--anchor markup--p-anchor" href="https://www.hackthebox.eu/home/users/profile/37879" target="_blank" rel="nofollow noopener" data-href="https://www.hackthebox.eu/home/users/profile/37879">https://www.hackthebox.eu/home/users/profile/37879</a></li>
<li class="graf graf--p">My Website: <a class="markup--anchor markup--p-anchor" href="https://olivierlaflamme.github.io/" target="_blank" rel="noopener nofollow noopener" data-href="https://olivierlaflamme.github.io/">https://olivierlaflamme.github.io/</a></li>
<li class="graf graf--p">My GitHub: <a class="markup--anchor markup--p-anchor" href="https://github.com/OlivierLaflamme" target="_blank" rel="noopener nofollow noopener" data-href="https://github.com/OlivierLaflamme">https://github.com/OlivierLaflamme</a></li>
<li class="graf graf--p">My WeChat QR below:</li>
</ul><figure id="bkmrk--15" class="graf graf--figure graf--layoutOutsetLeft"><img class="graf-image" src="https://cdn-images-1.medium.com/max/750/0*Jh0zrZrfyn8WjkDn.png" data-image-id="0*Jh0zrZrfyn8WjkDn.png" data-width="142" data-height="144"></figure></div>
</div>
