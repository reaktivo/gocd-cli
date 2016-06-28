function rawWrite(body) {
  process.stdout.write(body);
}

function write(body) {
  if (Array.isArray(body)) {
    write(body.join('\n') + '\n');
    return;
  }

  rawWrite(body);
}

module.exports = {
  write,
  rawWrite,
}
