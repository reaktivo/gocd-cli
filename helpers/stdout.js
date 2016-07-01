function rawWrite(body) {
  process.stdout.write(body);
}

function write(body) {
  if (Array.isArray(body)) {
    write(body.join('\n'));
    return;
  }

  rawWrite(body + '\n');
}

module.exports = {
  write,
  rawWrite,
}
