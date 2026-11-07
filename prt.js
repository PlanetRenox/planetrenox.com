import { PRT } from 'ortus'

// PRT ms when the page loaded, base 36 in uppercase; parseInt(s, 36) turns it back into PRT ms
document.getElementById('prt').textContent = PRT.now().toString(36).toUpperCase()
