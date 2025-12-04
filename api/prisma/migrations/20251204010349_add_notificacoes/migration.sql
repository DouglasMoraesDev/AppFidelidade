-- CreateTable
CREATE TABLE `Notificacao` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `estabelecimentoId` INTEGER NOT NULL,
    `titulo` VARCHAR(191) NOT NULL,
    `mensagem` TEXT NOT NULL,
    `tipo` VARCHAR(191) NOT NULL DEFAULT 'info',
    `lida` BOOLEAN NOT NULL DEFAULT false,
    `criadaEm` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    INDEX `Notificacao_estabelecimentoId_lida_idx`(`estabelecimentoId`, `lida`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `Notificacao` ADD CONSTRAINT `Notificacao_estabelecimentoId_fkey` FOREIGN KEY (`estabelecimentoId`) REFERENCES `Estabelecimento`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
