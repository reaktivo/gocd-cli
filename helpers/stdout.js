module.exports = {
  write: function write(body) {
    if (Array.isArray(body)) {
      write(body.join('\n'));
      return;
    }

    process.stdout.write(body + '\n');
  }
}
