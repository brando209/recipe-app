const toDecimal = (fraction) => {
    let result = 0, numer, denom;
    const [whole, frac] = fraction.split(' ');

    if(whole.includes('/')) {
        [numer, denom] = whole.split('/');
        result += Number(numer) / Number(denom)
    } else {
        result = Number(whole);
    }
    
    if(frac) {
        [numer, denom] = frac.split('/');
        result += Number(numer) / Number(denom)
    }
    
    return result;
}

module.exports = { toDecimal }