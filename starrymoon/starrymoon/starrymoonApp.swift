//
//  starrymoonApp.swift
//  starrymoon
//
//  Created by Cyrus on 23/05/2026.
//

import SwiftUI
import SwiftData
import UniformTypeIdentifiers

@main
struct starrymoonApp: App {
    var body: some Scene {
        DocumentGroup(editing: .itemDocument, migrationPlan: starrymoonMigrationPlan.self) {
            ContentView()
        }
    }
}

extension UTType {
    static var itemDocument: UTType {
        UTType(importedAs: "com.example.item-document")
    }
}

struct starrymoonMigrationPlan: SchemaMigrationPlan {
    static var schemas: [VersionedSchema.Type] = [
        starrymoonVersionedSchema.self,
    ]

    static var stages: [MigrationStage] = [
        // Stages of migration between VersionedSchema, if required.
    ]
}

struct starrymoonVersionedSchema: VersionedSchema {
    static var versionIdentifier = Schema.Version(1, 0, 0)

    static var models: [any PersistentModel.Type] = [
        Item.self,
    ]
}
