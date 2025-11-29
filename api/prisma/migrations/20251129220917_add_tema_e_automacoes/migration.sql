-- AlterTable
ALTER TABLE `Estabelecimento` ADD COLUMN `auto_notificar_voucher` BOOLEAN NOT NULL DEFAULT false,
    ADD COLUMN `lembrete_pontos_proximos` BOOLEAN NOT NULL DEFAULT false,
    ADD COLUMN `tema_config` TEXT NULL;
