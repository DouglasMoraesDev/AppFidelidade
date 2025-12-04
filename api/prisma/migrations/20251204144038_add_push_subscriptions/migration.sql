-- CreateTable
CREATE TABLE `PushSubscription` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `estabelecimentoId` INTEGER NOT NULL,
    `endpoint` VARCHAR(512) NOT NULL,
    `keys_p256dh` VARCHAR(255) NOT NULL,
    `keys_auth` VARCHAR(255) NOT NULL,
    `criadaEm` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    INDEX `PushSubscription_estabelecimentoId_idx`(`estabelecimentoId`),
    UNIQUE INDEX `PushSubscription_estabelecimentoId_endpoint_key`(`estabelecimentoId`, `endpoint`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `PushSubscription` ADD CONSTRAINT `PushSubscription_estabelecimentoId_fkey` FOREIGN KEY (`estabelecimentoId`) REFERENCES `Estabelecimento`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
