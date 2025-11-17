-- AlterTable: ajustar campos do estabelecimento para suportar assinatura e personalizações
ALTER TABLE `Estabelecimento`
    MODIFY `mensagem_voucher` LONGTEXT NULL,
    MODIFY `pontos_para_voucher` INTEGER NOT NULL DEFAULT 10,
    ADD COLUMN `assinaturaValidaAte` DATETIME(3) NULL,
    ADD COLUMN `nome_app` VARCHAR(191) NOT NULL DEFAULT 'AppFidelidade',
    ADD COLUMN `slug_publico` VARCHAR(191) NULL,
    ADD COLUMN `link_consulta` VARCHAR(191) NULL;

-- Preencher slug e assinatura para registros existentes
UPDATE `Estabelecimento`
SET
    `slug_publico` = IFNULL(`slug_publico`, CONCAT('estab-', `id`)),
    `assinaturaValidaAte` = IFNULL(`assinaturaValidaAte`, DATE_ADD(`createdAt`, INTERVAL 31 DAY));

-- Garantir que slug não seja nulo
ALTER TABLE `Estabelecimento`
    MODIFY `slug_publico` VARCHAR(191) NOT NULL,
    ADD UNIQUE INDEX `Estabelecimento_slug_publico_key`(`slug_publico`);

-- AlterTable: garantir unicidade do cartão por cliente/estabelecimento
ALTER TABLE `CartaoFidelidade`
    ADD CONSTRAINT `cartao_cliente_estabelecimento_unique` UNIQUE (`clienteId`, `estabelecimentoId`);

-- CreateTable: pagamentos de mensalidade
CREATE TABLE `MensalidadePagamento` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `estabelecimentoId` INTEGER NOT NULL,
    `pagoEm` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `MensalidadePagamento`
    ADD CONSTRAINT `MensalidadePagamento_estabelecimentoId_fkey`
    FOREIGN KEY (`estabelecimentoId`) REFERENCES `Estabelecimento`(`id`)
    ON DELETE CASCADE ON UPDATE CASCADE;

