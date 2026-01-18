/**
 * Database Migration Script: Railway → Cloud SQL
 *
 * This script migrates all your data from Railway PostgreSQL to GCP Cloud SQL.
 * Run this BEFORE switching your production traffic to GCP.
 *
 * Usage:
 *   1. Set environment variables (see below)
 *   2. Run: npx ts-node scripts/migrate-from-railway.ts
 */

import { PrismaClient } from "@prisma/client";

// ============================================
// CONFIGURATION - Update these values!
// ============================================

const RAILWAY_DATABASE_URL = process.env.RAILWAY_DATABASE_URL || "";
// Example: "postgresql://postgres:password@containers-us-west-XXX.railway.app:5432/railway"

const CLOUD_SQL_DATABASE_URL = process.env.CLOUD_SQL_DATABASE_URL || "";
// Example: "postgresql://apiuser:password@localhost:5432/conservation_db"
// Note: Start Cloud SQL Proxy first if using localhost

// ============================================
// Migration Script
// ============================================

async function migrate() {
  console.log("\n🚀 Starting database migration: Railway → Cloud SQL\n");

  // Validate configuration
  if (!RAILWAY_DATABASE_URL) {
    console.error("❌ Error: RAILWAY_DATABASE_URL environment variable is not set");
    console.log("\nSet it with:");
    console.log('  export RAILWAY_DATABASE_URL="postgresql://postgres:password@your-railway-host:5432/railway"');
    process.exit(1);
  }

  if (!CLOUD_SQL_DATABASE_URL) {
    console.error("❌ Error: CLOUD_SQL_DATABASE_URL environment variable is not set");
    console.log("\nSet it with:");
    console.log('  export CLOUD_SQL_DATABASE_URL="postgresql://apiuser:password@localhost:5432/conservation_db"');
    console.log("\nDon't forget to start Cloud SQL Proxy first:");
    console.log("  ./cloud-sql-proxy propane-library-400209:us-central1:dsqm-db &");
    process.exit(1);
  }

  // Create Prisma clients for both databases
  const railwayDb = new PrismaClient({
    datasources: { db: { url: RAILWAY_DATABASE_URL } },
  });

  const cloudSqlDb = new PrismaClient({
    datasources: { db: { url: CLOUD_SQL_DATABASE_URL } },
  });

  try {
    // Test connections
    console.log("📡 Testing connection to Railway database...");
    await railwayDb.$connect();
    console.log("✅ Connected to Railway database\n");

    console.log("📡 Testing connection to Cloud SQL database...");
    await cloudSqlDb.$connect();
    console.log("✅ Connected to Cloud SQL database\n");

    // ============================================
    // Step 1: Migrate Clients
    // ============================================
    console.log("📦 Migrating Clients...");

    const clients = await railwayDb.client.findMany();
    console.log(`   Found ${clients.length} clients in Railway`);

    if (clients.length > 0) {
      // Clear existing data in Cloud SQL (optional - comment out if you want to preserve)
      await cloudSqlDb.client.deleteMany();

      // Insert clients one by one to handle any issues
      let clientsCreated = 0;
      for (const client of clients) {
        try {
          await cloudSqlDb.client.create({
            data: {
              id: client.id,
              name: client.name,
              email: client.email,
              apiKey: client.apiKey,
              hectaresBought: client.hectaresBought,
              hectaresStock: client.hectaresStock,
              priceForHectare: client.priceForHectare,
              dailyLimit: client.dailyLimit,
            },
          });
          clientsCreated++;
        } catch (error) {
          console.error(`   ⚠️ Failed to migrate client ${client.id}: ${client.name}`);
          console.error(`      Error: ${error}`);
        }
      }
      console.log(`✅ Migrated ${clientsCreated}/${clients.length} clients\n`);
    }

    // ============================================
    // Step 2: Migrate Transactions
    // ============================================
    console.log("📦 Migrating Transactions...");

    const transactions = await railwayDb.transaction.findMany();
    console.log(`   Found ${transactions.length} transactions in Railway`);

    if (transactions.length > 0) {
      await cloudSqlDb.transaction.deleteMany();

      let txCreated = 0;
      for (const tx of transactions) {
        try {
          await cloudSqlDb.transaction.create({
            data: {
              id: tx.id,
              amountUSD: tx.amountUSD,
              createdAt: tx.createdAt,
              customerEmail: tx.customerEmail,
              clientId: tx.clientId,
            },
          });
          txCreated++;
        } catch (error) {
          console.error(`   ⚠️ Failed to migrate transaction ${tx.id}`);
          console.error(`      Error: ${error}`);
        }
      }
      console.log(`✅ Migrated ${txCreated}/${transactions.length} transactions\n`);
    }

    // ============================================
    // Step 3: Migrate Usages
    // ============================================
    console.log("📦 Migrating Usages...");

    const usages = await railwayDb.usage.findMany();
    console.log(`   Found ${usages.length} usages in Railway`);

    if (usages.length > 0) {
      await cloudSqlDb.usage.deleteMany();

      let usagesCreated = 0;
      for (const usage of usages) {
        try {
          await cloudSqlDb.usage.create({
            data: {
              id: usage.id,
              date: usage.date,
              usageCount: usage.usageCount,
              clientId: usage.clientId,
            },
          });
          usagesCreated++;
        } catch (error) {
          console.error(`   ⚠️ Failed to migrate usage ${usage.id}`);
          console.error(`      Error: ${error}`);
        }
      }
      console.log(`✅ Migrated ${usagesCreated}/${usages.length} usages\n`);
    }

    // ============================================
    // Step 4: Reset auto-increment sequences
    // ============================================
    console.log("🔧 Resetting ID sequences...");

    // Get max IDs
    const maxClientId = clients.length > 0 ? Math.max(...clients.map(c => c.id)) : 0;
    const maxTxId = transactions.length > 0 ? Math.max(...transactions.map(t => t.id)) : 0;
    const maxUsageId = usages.length > 0 ? Math.max(...usages.map(u => u.id)) : 0;

    // Reset sequences so new records get the right IDs
    if (maxClientId > 0) {
      await cloudSqlDb.$executeRawUnsafe(`SELECT setval('"Client_id_seq"', ${maxClientId}, true)`);
    }
    if (maxTxId > 0) {
      await cloudSqlDb.$executeRawUnsafe(`SELECT setval('"Transaction_id_seq"', ${maxTxId}, true)`);
    }
    if (maxUsageId > 0) {
      await cloudSqlDb.$executeRawUnsafe(`SELECT setval('"Usage_id_seq"', ${maxUsageId}, true)`);
    }

    console.log("✅ Sequences reset\n");

    // ============================================
    // Step 5: Verify migration
    // ============================================
    console.log("🔍 Verifying migration...\n");

    const cloudClients = await cloudSqlDb.client.count();
    const cloudTransactions = await cloudSqlDb.transaction.count();
    const cloudUsages = await cloudSqlDb.usage.count();

    console.log("   Railway (source)     →  Cloud SQL (destination)");
    console.log("   ─────────────────────────────────────────────────");
    console.log(`   Clients:      ${clients.length.toString().padStart(5)}  →  ${cloudClients.toString().padStart(5)}  ${clients.length === cloudClients ? "✅" : "⚠️"}`);
    console.log(`   Transactions: ${transactions.length.toString().padStart(5)}  →  ${cloudTransactions.toString().padStart(5)}  ${transactions.length === cloudTransactions ? "✅" : "⚠️"}`);
    console.log(`   Usages:       ${usages.length.toString().padStart(5)}  →  ${cloudUsages.toString().padStart(5)}  ${usages.length === cloudUsages ? "✅" : "⚠️"}`);

    const allMatch =
      clients.length === cloudClients &&
      transactions.length === cloudTransactions &&
      usages.length === cloudUsages;

    if (allMatch) {
      console.log("\n🎉 Migration completed successfully!\n");
      console.log("Next steps:");
      console.log("  1. Test your API with the new Cloud SQL database");
      console.log("  2. Deploy to Cloud Run");
      console.log("  3. Update your domain to point to Cloud Run");
      console.log("  4. Keep Railway running for a few days as backup");
      console.log("  5. Once confirmed working, shut down Railway\n");
    } else {
      console.log("\n⚠️ Migration completed with some discrepancies.");
      console.log("Please review the output above and check for errors.\n");
    }

  } catch (error) {
    console.error("\n❌ Migration failed:", error);
    process.exit(1);
  } finally {
    await railwayDb.$disconnect();
    await cloudSqlDb.$disconnect();
  }
}

// Run the migration
migrate();