$path = "C:\Users\Vishnu\.gemini\antigravity\scratch\mcoc-master-hub\js\data.js"
$content = [System.IO.File]::ReadAllText($path, [System.Text.Encoding]::UTF8)
$dict = @{
    '"CGR"' = '"Cosmic Ghost Rider"'
    '"Hulking"' = '"Hulkling"'
    '"VOX"' = '"Vox"'
    '"Serpent"' = '"The Serpent"'
    '"Hit Mokey"' = '"Hit-Monkey"'
    '"NickFury"' = '"Nick Fury"'
    '"Archangle"' = '"Archangel"'
    '"Apocalypes"' = '"Apocalypse"'
    '"Doom"' = '"Doctor Doom"'
    '"BLCV"' = '"Black Widow (Claire Voyant)"'
    '"BWCV"' = '"Black Widow (Claire Voyant)"'
    '"Nicro"' = '"Nico Minoru"'
    '"Human Tourch"' = '"Human Torch"'
    '"Nimord"' = '"Nimrod"'
    '"shuri"' = '"Shuri"'
    '"Infamous Iron man"' = '"Iron Man (Infamous)"'
    '"VIV Vision"' = '"Viv Vision"'
    '"IronHeart"' = '"Ironheart"'
    '"ABS man"' = '"Absorbing Man"'
    '"Pavitra prabakar"' = '"Spider-Man (India)"'
    '"Capatain Britain"' = '"Captain Britain"'
    '"Anti Venom"' = '"Anti-Venom"'
    '"Shehulk"' = '"She-Hulk"'
    '"Wepon X"' = '"Wolverine (Weapon X)"'
    '"Count nefaria"' = '"Count Nefaria"'
    '"Baran Zemo"' = '"Baron Zemo"'
    '"Hawkey"' = '"Hawkeye"'
    '"Rocker Raccon"' = '"Rocket Raccoon"'
    '"Hulk (imortal)"' = '"Immortal Hulk"'
    '"VOODOO"' = '"Doctor Voodoo"'
    '"Magneto(white)"' = '"Magneto (House of X)"'
    '"Cheelith"' = '"Chee'ilth"'
    '"Spider all"' = '"Spider-Man (Classic)"'
    '"Mole man"' = '"Mole Man"'
    '"miles"' = '"Spider-Man (Miles Morales)"'
    '"MR.knight"' = '"Mister Knight"'
    '"G 2099"' = '"Guillotine 2099"'
    '"LongShot"' = '"Longshot"'
    '"Jeo Fixit"' = '"Joe Fixit"'
    '"Hella"' = '"Hela"'
}
foreach ($k in $dict.Keys) {
    $content = $content.Replace($k, $dict[$k])
}
[System.IO.File]::WriteAllText($path, $content, [System.Text.Encoding]::UTF8)
Write-Output "Names updated successfully in data.js!"
