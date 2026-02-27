<?php

declare(strict_types=1);

final class DomainError extends RuntimeException {
  private string $codeName;
  private array $payload;

  public function __construct(string $codeName, string $message, int $status = 400, array $payload = []) {
    parent::__construct($message, $status);
    $this->codeName = $codeName;
    $this->payload = $payload;
  }

  public function getCodeName(): string {
    return $this->codeName;
  }

  public function getStatus(): int {
    return (int)$this->getCode();
  }

  public function getPayload(): array {
    return $this->payload;
  }
}
