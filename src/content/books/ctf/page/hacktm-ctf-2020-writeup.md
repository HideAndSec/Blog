---
title: "HackTM CTF 2020 Writeup"
slug: "hacktm-ctf-2020-writeup"
priority: 3
editor: "wysiwyg"
revisionCount: 2
id: 53
createdAt: "2020-10-03T16:16:10Z"
createdBy: "boschko"
updatedAt: "2020-10-03T18:26:31Z"
updatedBy: "boschko"
ownedBy: "boschko"
views: 7
---
<p id="bkmrk-since-the-ctf-is-sti">Since the CTF is still active I wont be dropping the flags. You can follow along and complete the challenges for yourself here: <a href="https://ctfx.hacktm.ro/">https://ctfx.hacktm.ro/</a></p>
<h2 id="bkmrk-0x01-strange-pcap">0x01 Strange PCAP</h2>
<p id="bkmrk-"><a href="/uploads/images/gallery/2020-10/n2sLl24sdy0hmqRL-image-1601741894500.png" target="_blank" rel="noopener"><img src="/uploads/images/gallery/2020-10/scaled-1680-/n2sLl24sdy0hmqRL-image-1601741894500.png" alt="image-1601741894500.png"></a></p>
<p id="bkmrk-a-basic-pcap-forensi">A basic PCAP forensics question. When you get the file, you will find that there are many USB Massive Storage packages. The initial guess is to find the flag in it.</p>
<p id="bkmrk--0"><a href="/uploads/images/gallery/2020-10/ljCgzlC4vHBbToDA-image-1601742015495.png" target="_blank" rel="noopener"><img src="/uploads/images/gallery/2020-10/scaled-1680-/ljCgzlC4vHBbToDA-image-1601742015495.png" alt="image-1601742015495.png"></a></p>
<p id="bkmrk--1"><a href="/uploads/images/gallery/2020-10/PGQpjxY9VNCshqlY-image-1601742075052.png" target="_blank" rel="noopener"><img src="/uploads/images/gallery/2020-10/scaled-1680-/PGQpjxY9VNCshqlY-image-1601742075052.png" alt="image-1601742075052.png"></a></p>
<p id="bkmrk-looking-through-the-">Looking through the data packets one by one, I found the ZIP file header and Flag.txt in Frame 1224, extract them and have a look.</p>
<p id="bkmrk--2"><a href="/uploads/images/gallery/2020-10/5jwyOJRvTRyCgD7N-image-1601742136284.png" target="_blank" rel="noopener"><img src="/uploads/images/gallery/2020-10/scaled-1680-/5jwyOJRvTRyCgD7N-image-1601742136284.png" alt="image-1601742136284.png"></a></p>
<p id="bkmrk-after-extracting-the">After extracting the data, it is found to be an encrypted compressed package. Check it with 010 Editor and find that it is really encrypted. Next, we have to find the password. Let's make a preliminary guess about the HID package sent by the keyboard because we have seen the USB HID data package before Types of.</p>
<p id="bkmrk--3"><a href="/uploads/images/gallery/2020-10/3evhvMeaT5eJ91i1-image-1601742566015.png" target="_blank" rel="noopener"><img src="/uploads/images/gallery/2020-10/scaled-1680-/3evhvMeaT5eJ91i1-image-1601742566015.png" alt="image-1601742566015.png"></a></p>
<p id="bkmrk-scrolling-down%2C-i-sa">Scrolling down, I saw a lot of URB_INTERRUPT types. We exported these data packets with tshark. For the detailed process, please refer to the second <a href="https://blog.berd.moe/archives/milkice-2020-redpacket-writeup/" target="_blank" rel="noreferrer noopener" aria-label=" (opens in a new tab)">level</a> of <a href="https://blog.berd.moe/archives/milkice-2020-redpacket-writeup/" target="_blank" rel="noreferrer noopener" aria-label=" (opens in a new tab)">the 2020 New Year Red Packet Writeup</a> of <a href="https://blog.berd.moe/archives/milkice-2020-redpacket-writeup/" target="_blank" rel="noreferrer noopener" aria-label=" (opens in a new tab)">Milk Ice</a> . I will not repeat it here.</p>
<p id="bkmrk-refer-to-the%C2%A0usb-key">Refer to the <a href="https://wiki.osdev.org/USB_Human_Interface_Devices" target="_blank" rel="noreferrer noopener" aria-label="USB Keyboard data packet format (opens in a new tab)">USB Keyboard data packet format</a> , you can know that the first Byte of each packet corresponds to the state of the control key, and the third Byte corresponds to the input key.</p>
<p id="bkmrk-combined-with-the%C2%A0us">Combined with the <a href="https://gist.github.com/MightyPork/6da26e382a7ad91b5496ee55fdc73db2" target="_blank" rel="noreferrer noopener" aria-label="USB HID Keyboard scan codes (opens in a new tab)">USB HID Keyboard scan codes, the</a> following script can be constructed to analyze the data packet.</p>
<pre id="bkmrk-usb_codes-%3D-%7B-0x04%3A%22"><code class="language-python">usb_codes = {
	0x04:"aA", 0x05:"bB", 0x06:"cC", 0x07:"dD", 0x08:"eE", 0x09:"fF",
	0x0A:"gG", 0x0B:"hH", 0x0C:"iI", 0x0D:"jJ", 0x0E:"kK", 0x0F:"lL",
	0x10:"mM", 0x11:"nN", 0x12:"oO", 0x13:"pP", 0x14:"qQ", 0x15:"rR",
	0x16:"sS", 0x17:"tT", 0x18:"uU", 0x19:"vV", 0x1A:"wW", 0x1B:"xX",
	0x1C:"yY", 0x1D:"zZ", 0x1E:"1!", 0x1F:"2@", 0x20:"3#", 0x21:"4$",
	0x22:"5%", 0x23:"6^", 0x24:"7&amp;", 0x25:"8*", 0x26:"9(", 0x27:"0)",
	0x2C:"  ", 0x2D:"-_", 0x2E:"=+", 0x2F:"[{", 0x30:"]}",  0x32:"#~",
	0x33:";:", 0x34:"'\"",  0x36:",&lt;",  0x37:".&gt;"
}
data = ''
for x in open("xd","r").readlines():
	code = int(x[4:6],16)
	print(x[4:6])
	if code == 0:
		continue
	if code == 0x28:
		print('ENTER!')
		print(data)
		data = ''
		continue
	upper = 0
	if int(x[0:2],16) == 0x02 or int(x[0:2],16) == 0x20:
		upper = 1
	data += usb_codes[code][upper]
print(data)</code></pre>
<p id="bkmrk-after-parsing%2C-the-c">After parsing, the compressed package password is obtained and completed.</p>
<p id="bkmrk-%C2%A0"> </p>
<h2 id="bkmrk-0x02-rr">0x02 RR</h2>
<p id="bkmrk--4"><br><a href="/uploads/images/gallery/2020-10/5Lq6mhGc6YZirobb-image-1601742747983.png" target="_blank" rel="noopener"><img src="/uploads/images/gallery/2020-10/scaled-1680-/5Lq6mhGc6YZirobb-image-1601742747983.png" alt="image-1601742747983.png"></a></p>
<p id="bkmrk--5"><a href="/uploads/images/gallery/2020-10/y5wxkH8aKFGODbbt-image-1601742870696.png" target="_blank" rel="noopener"><img src="/uploads/images/gallery/2020-10/scaled-1680-/y5wxkH8aKFGODbbt-image-1601742870696.png" alt="image-1601742870696.png"></a></p>
<p id="bkmrk-i-got-the-title-and-">I got the title and found that there are three imgs, two of which are the same size, and the other is 0.</p>
<p id="bkmrk-according-to-the-mea">According to the meaning of the title "One of my drives failed", it is guessed that the file with a size of 0 is the damaged disk. According to the two disks can "recovering all my files", it may be a RAID array</p>
<p id="bkmrk--6"><a href="/uploads/images/gallery/2020-10/0qMPj5Q1uDsKGs1V-image-1601749270654.png" target="_blank" rel="noopener"><img src="/uploads/images/gallery/2020-10/scaled-1680-/0qMPj5Q1uDsKGs1V-image-1601749270654.png" alt="image-1601749270654.png"></a></p>
<p id="bkmrk-%C2%A0-0">But there is a hole in this question. The beginning of the img file is filled with an invalid partition table. Using the file command or directly checking with mdadm will not be recognized as a RAID disk. Check with binwalk to find the correct offset.</p>
<p id="bkmrk-%C2%A0-1">Here, use dd to simply crop this file, and then use mdadm to view the detailed RAID information, it is indeed a RAID5. Next, create a loop and then do with losetup <code style="font-family: 'Yahei Consolas Hybird', Consolas, 'Ubuntu Mono', Monaco, Menlo, 'Courier New', monospace, sans-serif; font-size: 12px; margin: 0px 6px; padding: 2px; display: inline; background: rgba(0, 0, 0, 0.2); color: #fefefe; border: 1.5px solid #aaaaaa; word-break: break-all; overflow-wrap: break-word; transition: all 0.2s linear 0s; line-height: 24px; font-style: normal; font-variant-ligatures: normal; font-variant-caps: normal; font-weight: 400; letter-spacing: normal; orphans: 2; text-align: left; text-indent: 0px; text-transform: none; white-space: normal; widows: 2; word-spacing: 0px; -webkit-text-stroke-width: 0px; text-decoration-style: initial; text-decoration-color: initial;" contenteditable="true" spellcheck="false">mdadm --assemble --run /dev/md0 --readonly /dev/loop0 /dev/loop1</code>directly mount the hard drive on it. Here you go losetup -o rather use the dd process the file because encountered some mysterious Bug.</p>
<p id="bkmrk--7"><a href="/uploads/images/gallery/2020-10/tcLchN0AlSFuE9ri-image-1601749587835.png" target="_blank" rel="noopener"><img src="/uploads/images/gallery/2020-10/scaled-1680-/tcLchN0AlSFuE9ri-image-1601749587835.png" alt="image-1601749587835.png"></a></p>
<p id="bkmrk-%C2%A0-2"> </p>
<p id="bkmrk-%C2%A0-3"> </p>
<p id="bkmrk-%C2%A0-4"> </p>
<p id="bkmrk-%C2%A0-5"> </p>
<p id="bkmrk-%C2%A0-6"> </p>
<p id="bkmrk-%C2%A0-7"> </p>
<p id="bkmrk-%C2%A0-8"> </p>
<p id="bkmrk-%C2%A0-9"> </p>
<p id="bkmrk-%C2%A0-10"> </p>
<p id="bkmrk-%C2%A0-11"> </p>
<p id="bkmrk-%C2%A0-12"> </p>
<p id="bkmrk-%C2%A0-13"> </p>
<p id="bkmrk-%C2%A0-14"> </p>
<p id="bkmrk-%C2%A0-15"> </p>
<p id="bkmrk-%C2%A0-16"> </p>
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
