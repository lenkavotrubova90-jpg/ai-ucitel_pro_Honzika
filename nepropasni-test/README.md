# Nepropásni – sdílený rodinný test

Testovací PWA pro synchronizaci rodinných událostí, nákupního seznamu a domácích úkolů mezi zařízeními.

## Jak funguje synchronizace

Aplikace používá Yjs a y-webrtc. Zařízení se stejným rodinným kódem sdílejí data peer-to-peer. Data se ukládají také do IndexedDB jednotlivých prohlížečů.

## Omezení testovací verze

- Alespoň dvě zařízení musí být současně online, aby si předala nové změny.
- Neexistuje centrální cloudová záloha.
- Fotografie dokumentů se nesdílejí; sdílí se pouze vytvořený termín.
- Nepoužívejte citlivé osobní údaje ani skutečné lékařské dokumenty.
