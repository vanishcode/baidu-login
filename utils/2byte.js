/**
 * @file 字符串转字节数组
 * @author vanishcode
 */

module.exports = function (str) {
    let ch, st, re = [];
    for (let i = 0; i < str.length; i++) {
        ch = str.charCodeAt(i);
        st = [];
        do {
            st.push(ch & 0xFF);
            ch = ch >> 8;
        }
        while (ch);
        re = re.concat(st.reverse());
    }
    return re.reverse();
}