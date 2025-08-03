#!/bin/bash

# Procurement Module Setup Script for Payment Track
# This script helps set up the procurement module dependencies and configurations

echo "🚀 Setting up Procurement Module for Payment Track..."

# Check if we're in the correct directory
if [ ! -f "package.json" ]; then
    echo "❌ Error: package.json not found. Please run this script from the payment-track root directory."
    exit 1
fi

echo "✅ Found package.json, proceeding with setup..."

# Check if required dependencies are installed
echo "📦 Checking dependencies..."

# List of required packages for the procurement module
REQUIRED_PACKAGES=(
    "date-fns"
    "lucide-react"
    "framer-motion"
    "@radix-ui/react-dialog"
    "@radix-ui/react-select"
    "@radix-ui/react-tabs"
    "@radix-ui/react-badge"
)

MISSING_PACKAGES=()

for package in "${REQUIRED_PACKAGES[@]}"; do
    if ! npm list "$package" > /dev/null 2>&1; then
        MISSING_PACKAGES+=("$package")
    fi
done

if [ ${#MISSING_PACKAGES[@]} -gt 0 ]; then
    echo "⚠️  Missing packages detected. Installing..."
    npm install "${MISSING_PACKAGES[@]}"
    echo "✅ Dependencies installed successfully!"
else
    echo "✅ All required dependencies are already installed!"
fi

# Check if Firestore indexes are needed
echo "🔥 Checking Firestore configuration..."

if [ -f "firestore.indexes.json" ]; then
    echo "✅ Firestore indexes file exists"
else
    echo "⚠️  Creating firestore.indexes.json with recommended indexes..."
    cat > firestore.indexes.json << EOF
{
  "indexes": [
    {
      "collectionGroup": "procurementRequests",
      "queryScope": "COLLECTION",
      "fields": [
        {
          "fieldPath": "status",
          "order": "ASCENDING"
        },
        {
          "fieldPath": "createdAt",
          "order": "DESCENDING"
        }
      ]
    },
    {
      "collectionGroup": "procurementRequests",
      "queryScope": "COLLECTION",
      "fields": [
        {
          "fieldPath": "projectId",
          "order": "ASCENDING"
        },
        {
          "fieldPath": "createdAt",
          "order": "DESCENDING"
        }
      ]
    },
    {
      "collectionGroup": "procurementRequests",
      "queryScope": "COLLECTION",
      "fields": [
        {
          "fieldPath": "createdBy",
          "order": "ASCENDING"
        },
        {
          "fieldPath": "createdAt",
          "order": "DESCENDING"
        }
      ]
    }
  ],
  "fieldOverrides": []
}
EOF
    echo "✅ Created firestore.indexes.json with procurement indexes"
fi

# Check if Firestore rules include procurement rules
echo "🔒 Checking Firestore security rules..."

if [ -f "firestore.rules" ]; then
    if grep -q "procurementRequests" firestore.rules; then
        echo "✅ Procurement rules already exist in firestore.rules"
    else
        echo "⚠️  Adding procurement rules to firestore.rules..."
        cat >> firestore.rules << EOF

    // Procurement Requests Rules
    match /procurementRequests/{requestId} {
      allow read: if request.auth != null;
      allow create: if request.auth != null &&
                    validateProcurementRequest(resource.data) &&
                    request.auth.uid == resource.data.createdBy;
      allow update: if request.auth != null &&
                    validateProcurementUpdate(resource.data, request.resource.data);
      allow delete: if request.auth != null;

      function validateProcurementRequest(data) {
        return data.keys().hasAll(['materialName', 'quantity', 'projectId', 'status', 'createdBy', 'createdAt']) &&
               data.materialName is string &&
               data.quantity is string &&
               data.projectId is string &&
               data.status in ['pending', 'quantity_checked', 'approved', 'rejected', 'ordered', 'arrived', 'processing', 'shipped'] &&
               data.createdBy is string &&
               data.createdAt is timestamp;
      }

      function validateProcurementUpdate(oldData, newData) {
        return newData.diff(oldData).affectedKeys().hasOnly(['status', 'updatedAt', 'statusHistory', 'managerNotes']);
      }
    }
EOF
        echo "✅ Added procurement rules to firestore.rules"
    fi
else
    echo "⚠️  firestore.rules not found. Please add procurement rules manually."
fi

# Check TypeScript configuration
echo "🔧 Checking TypeScript configuration..."

if [ -f "tsconfig.json" ]; then
    echo "✅ TypeScript configuration found"
else
    echo "⚠️  tsconfig.json not found. Please ensure TypeScript is properly configured."
fi

# Run type checking
echo "🏗️  Running type check..."
if npx tsc --noEmit > /dev/null 2>&1; then
    echo "✅ Type checking passed!"
else
    echo "⚠️  Type checking failed. Please check the console output above."
fi

echo ""
echo "🎉 Procurement Module Setup Complete!"
echo ""
echo "📋 Next Steps:"
echo "1. Deploy Firestore indexes: firebase deploy --only firestore:indexes"
echo "2. Deploy Firestore rules: firebase deploy --only firestore:rules"
echo "3. Start the development server: npm run dev"
echo "4. Navigate to /dashboard/procurement to test the module"
echo ""
echo "📖 Documentation:"
echo "- Module documentation: docs/PROCUREMENT_MODULE.md"
echo "- API endpoints: /api/procurement/*"
echo "- Components: app/dashboard/procurement/"
echo ""
echo "✨ Happy coding!"
