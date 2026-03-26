#!/usr/bin/env python3
"""
Nokiatis Launcher Rebranding Script
This script scans all project files and replaces old branding with Nokiatis branding.
"""

import os
import re
import sys
from pathlib import Path

# Define replacements
REPLACEMENTS = {
    # GDLauncher -> Nokiatis Launcher
    'GDLauncher': 'Nokiatis Launcher',
    'gdlauncher': 'nokiatis-launcher',
    'GDlauncher': 'Nokiatis Launcher',
    'Gdlauncher': 'Nokiatis Launcher',
    
    # Domain replacements
    'gdlauncher.com': 'nokiatislauncher.com',
    'gdl.gg': 'nokiatis.gg',
    'api.gdl.gg': 'api.nokiatis.gg',
    'test-api.gdl.gg': 'test-api.nokiatis.gg',
    'meta.gdl.gg': 'meta.nokiatis.gg',
    
    # Company/Developer replacements
    'GorillaDevs': 'NokiatisTeam',
    'GorillaDevs, Inc.': 'NokiatisTeam',
    'Gorilla Devs': 'Nokiatis Team',
    'gorilla-devs': 'nokiatis-team',
    'gorilladevs': 'nokiatis',
    
    # Additional common variations
    'GDL': 'Nokiatis',
    'gdl': 'nokiatis',
    
    # User agent and identifiers
    'GDLLauncher': 'NokiatisLauncher',
    'gdlauncher-app': 'nokiatis-launcher',
    
    # Package names
    'org.gdlauncher': 'com.nokiatis.launcher',
    'com.gdlauncher': 'com.nokiatis.launcher',
}

# Files to skip (binary files, images, etc.)
SKIP_EXTENSIONS = {
    '.png', '.jpg', '.jpeg', '.gif', '.ico', '.svg', '.webp',
    '.woff', '.woff2', '.ttf', '.eot', '.otf',
    '.mp3', '.mp4', '.wav', '.ogg', '.flac',
    '.zip', '.tar', '.gz', '.rar', '.7z',
    '.exe', '.dll', '.so', '.dylib',
    '.pdb', '.dbg',
    '.lock',  # package-lock, cargo.lock - usually auto-generated
    '.sum',   # go.sum
}

# Directories to skip
SKIP_DIRS = {
    'node_modules',
    'target',
    'dist',
    'build',
    '.git',
    '.cargo',
    'vendor',
    '__pycache__',
    '.next',
    'release',
    '.tauri',
}

# Files to skip by name
SKIP_FILES = {
    'rebrand.py',
    'Cargo.lock',
    'pnpm-lock.yaml',
    'package-lock.json',
    'yarn.lock',
}


def should_skip_file(filepath: Path) -> bool:
    """Check if a file should be skipped."""
    # Skip by extension
    if filepath.suffix.lower() in SKIP_EXTENSIONS:
        return True
    
    # Skip by filename
    if filepath.name in SKIP_FILES:
        return True
    
    # Skip binary files
    try:
        with open(filepath, 'rb') as f:
            chunk = f.read(8192)
            if b'\x00' in chunk:
                return True
    except:
        return True
    
    return False


def should_skip_dir(dirname: str) -> bool:
    """Check if a directory should be skipped."""
    return dirname in SKIP_DIRS or dirname.startswith('.')


def replace_in_file(filepath: Path, dry_run: bool = True) -> tuple[int, list[str]]:
    """
    Replace branding in a single file.
    Returns (count of replacements, list of changes).
    """
    changes = []
    total_replacements = 0
    
    try:
        with open(filepath, 'r', encoding='utf-8', errors='ignore') as f:
            content = f.read()
    except Exception as e:
        return 0, [f"Error reading file: {e}"]
    
    original_content = content
    
    # Apply each replacement
    for old, new in REPLACEMENTS.items():
        # Case-insensitive replacement for some patterns
        count = content.count(old)
        if count > 0:
            content = content.replace(old, new)
            total_replacements += count
            changes.append(f"  '{old}' -> '{new}' ({count}x)")
    
    # If changes were made and not dry run, write back
    if content != original_content:
        if not dry_run:
            try:
                with open(filepath, 'w', encoding='utf-8') as f:
                    f.write(content)
            except Exception as e:
                return total_replacements, [f"Error writing file: {e}"]
    
    return total_replacements, changes


def scan_directory(root_dir: Path, dry_run: bool = True) -> dict:
    """
    Scan all files in directory for branding replacements.
    Returns dict with statistics.
    """
    stats = {
        'files_scanned': 0,
        'files_modified': 0,
        'total_replacements': 0,
        'changes_by_file': {},
        'errors': [],
    }
    
    for root, dirs, files in os.walk(root_dir):
        # Filter out skip directories
        dirs[:] = [d for d in dirs if not should_skip_dir(d)]
        
        for filename in files:
            filepath = Path(root) / filename
            
            if should_skip_file(filepath):
                continue
            
            stats['files_scanned'] += 1
            
            try:
                count, changes = replace_in_file(filepath, dry_run)
                
                if count > 0:
                    stats['files_modified'] += 1
                    stats['total_replacements'] += count
                    relative_path = filepath.relative_to(root_dir)
                    stats['changes_by_file'][str(relative_path)] = changes
            except Exception as e:
                stats['errors'].append(f"{filepath}: {e}")
    
    return stats


def print_report(stats: dict):
    """Print a detailed report of changes."""
    print("\n" + "=" * 70)
    print("NOKIATIS LAUNCHER REBRANDING REPORT")
    print("=" * 70)
    
    print(f"\n📊 Statistics:")
    print(f"   Files scanned:    {stats['files_scanned']}")
    print(f"   Files modified:   {stats['files_modified']}")
    print(f"   Total changes:    {stats['total_replacements']}")
    
    if stats['errors']:
        print(f"\n❌ Errors ({len(stats['errors'])}):")
        for error in stats['errors'][:10]:
            print(f"   {error}")
        if len(stats['errors']) > 10:
            print(f"   ... and {len(stats['errors']) - 10} more errors")
    
    if stats['changes_by_file']:
        print(f"\n📝 Changes by file:")
        for filepath, changes in sorted(stats['changes_by_file'].items()):
            print(f"\n   📄 {filepath}")
            for change in changes:
                print(change)
    
    print("\n" + "=" * 70)


def main():
    """Main entry point."""
    import argparse
    
    parser = argparse.ArgumentParser(
        description='Rebrand GDLauncher to Nokiatis Launcher'
    )
    parser.add_argument(
        '--apply',
        action='store_true',
        help='Actually apply changes (default is dry-run)'
    )
    parser.add_argument(
        '--dir',
        type=str,
        default='.',
        help='Directory to scan (default: current directory)'
    )
    parser.add_argument(
        '--verbose', '-v',
        action='store_true',
        help='Show detailed output'
    )
    
    args = parser.parse_args()
    
    root_dir = Path(args.dir).resolve()
    
    print(f"\n🔍 Scanning directory: {root_dir}")
    print(f"   Mode: {'APPLY CHANGES' if args.apply else 'DRY RUN (no changes)'}")
    print(f"\n📋 Replacements configured: {len(REPLACEMENTS)}")
    print("\n   Key replacements:")
    print("   • GDLauncher → Nokiatis Launcher")
    print("   • gdlauncher.com → nokiatislauncher.com")
    print("   • GorillaDevs → NokiatisTeam")
    print("   • gdl.gg → nokiatis.gg")
    
    stats = scan_directory(root_dir, dry_run=not args.apply)
    
    if args.verbose:
        print_report(stats)
    else:
        print(f"\n📊 Summary:")
        print(f"   Files scanned:    {stats['files_scanned']}")
        print(f"   Files to modify:  {stats['files_modified']}")
        print(f"   Total changes:    {stats['total_replacements']}")
        
        if stats['changes_by_file']:
            print(f"\n📁 Files with changes:")
            for filepath in sorted(stats['changes_by_file'].keys())[:20]:
                print(f"   • {filepath}")
            if len(stats['changes_by_file']) > 20:
                print(f"   ... and {len(stats['changes_by_file']) - 20} more files")
    
    if not args.apply:
        print("\n⚠️  DRY RUN - No changes were made.")
        print("   Run with --apply to actually make changes.")
    else:
        print("\n✅ Changes applied!")
    
    return 0


if __name__ == '__main__':
    sys.exit(main())
