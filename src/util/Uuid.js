module.exports = function () {
    let stamp = new Date().getTime();
    let rand = +(Math.random() + '').slice(2);
    return stamp.toString(36) + rand.toString(36);
};