<?php

declare(strict_types=1);

require_once __DIR__ . '/../../app/shared/domain/domain-error.php';

function assert_true(bool $condition, string $message): void {
  if (!$condition) {
    fwrite(STDERR, "FAIL: {$message}\n");
    exit(1);
  }
}

$error = new DomainError('TEST_CODE', 'Mensagem de teste', 422, ['field' => 'example']);
assert_true($error->getCodeName() === 'TEST_CODE', 'DomainError should expose code name');
assert_true($error->getStatus() === 422, 'DomainError should expose HTTP status');
assert_true(($error->getPayload()['field'] ?? '') === 'example', 'DomainError should expose payload');

fwrite(STDOUT, "PASS: domain-error.test.php\n");
