#!/usr/bin/env node

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');
const ansis = require('ansis');
const inquirer = require('inquirer').default;

const VERSION_ALIAS_MAP = {
  alpha: 'prerelease',
  prer: 'prerelease',
  prep: 'prepatch',
  premi: 'preminor',
  prema: 'premajor',
  fix: 'patch',
  p: 'patch',
  mi: 'minor',
  ma: 'major',
  nv: 'no-version',
};

(async () => {
  const overallStartTime = new Date();
  // Check for console logs
  let startTime = new Date();
  const rootDir = path.join(__dirname, '..');

  try {
    const srcPath = path.join(rootDir, 'projects', 'ui', 'src', 'lib');

    // search all .ts files for console.log
    const files = fs.readdirSync(srcPath, { recursive: true }).filter(file => file.endsWith('.ts'));
    for (const file of files) {
      const filePath = path.join(srcPath, file);
      const content = fs.readFileSync(filePath, 'utf8');
      const lines = content.split('\n');
      const lineIndex = lines.findIndex(line => line.includes('console.log'));
      if (lineIndex !== -1) {
        console.error(
          `${ansis.redBright.bold('✕')} Error: Found console.log statements in ${ansis.underline(filePath)} (line ${lineIndex + 1}). Please remove them before releasing.`
        );
        return;
      }
    }
    console.log(
      `${ansis.greenBright.bold('✓')} No console.log statements found. Proceeding... (${new Date().valueOf() - startTime.valueOf()} ms)`
    );
  } catch (error) {
    console.error(error);
  }

  // Check if all changes are committed
  startTime = new Date();
  try {
    execSync('git diff-index --quiet HEAD --');
    console.log(
      `${ansis.greenBright.bold('✓')} No uncommmitted changes. Proceeding... (${new Date().valueOf() - startTime.valueOf()} ms)`
    );
  } catch (error) {
    console.error(`${ansis.redBright.bold('✕')} Error: You have uncommitted changes. Please commit or stash them first.`);
    return;
  }

  let bumpType = process.argv[2];
  if (VERSION_ALIAS_MAP[bumpType]) {
    bumpType = VERSION_ALIAS_MAP[bumpType];
  }

  const preVersions = ['prerelease', 'prepatch', 'preminor', 'premajor'];
  const allowedBumpTypes = ['patch', 'minor', 'major', ...preVersions, 'no-version'];

  if (!bumpType || !allowedBumpTypes.includes(bumpType)) {
    const anwsers = await inquirer.prompt([
      {
        type: 'list',
        name: 'bumpType',
        message: 'Select version bump type: ',
        choices: allowedBumpTypes,
        default: 'patch',
      },
    ]);
    bumpType = anwsers.bumpType;
  }
  try {
    const libraryPackagePath = path.join(rootDir, 'projects', 'ui', 'package.json');

    function readVersion() {
      const libraryPackageJson = JSON.parse(fs.readFileSync(libraryPackagePath, 'utf8'));
      return libraryPackageJson.version;
    }

    const isNoVersionBump = bumpType === 'no-version';
    const isAlphaBump = preVersions.includes(bumpType) || (isNoVersionBump && readVersion().includes('alpha'));

    // Bump the package version
    const oldVersion = readVersion();
    let finalVersion = oldVersion;

    if (!isNoVersionBump) {
      const versionToBeSet = isAlphaBump ? bumpType + ' --preid=alpha' : bumpType;

      execSync(`cd projects/ui && npm version ${versionToBeSet}`, {
        stdio: 'ignore',
      });
      const newVersion = readVersion();
      finalVersion = newVersion;

      console.log(
        `${ansis.greenBright.bold('✓')} Changed version from ${ansis.redBright.underline(
          oldVersion
        )} -> ${ansis.blueBright.underline(newVersion)} (${new Date().valueOf() - startTime.valueOf()} ms)`
      );
      startTime = new Date();

      // Commit and push changes
      execSync('git add .', { stdio: 'ignore' });
      execSync(`git commit -m "v${newVersion}"`, { stdio: 'ignore' });
      execSync('git push', { stdio: 'ignore' });

      console.log(
        `${ansis.greenBright.bold('✓')} Committed and pushed changes (${new Date().valueOf() - startTime.valueOf()} ms)`
      );
      startTime = new Date();

      // Create a new tag and push it
      execSync(`git tag v${newVersion}`, { stdio: 'ignore' });
      execSync('git push --tags', { stdio: 'ignore' });

      console.log(`${ansis.greenBright.bold('✓')} Created a version tag (${new Date().valueOf() - startTime.valueOf()} ms)`);
    } else {
      console.log(
        `${ansis.blueBright.bold('-')} Skipping version bump. Current version: ${ansis.blueBright.underline(oldVersion)} (${
          new Date().valueOf() - startTime.valueOf()
        } ms)`
      );
    }
    startTime = new Date();

    // Cleanup
    if (fs.existsSync(path.join(rootDir, 'dist'))) {
      execSync('rmdir /s /Q dist', { stdio: 'ignore' });

      console.log(`${ansis.greenBright.bold('✓')} Cleaned up dist directory (${new Date().valueOf() - startTime.valueOf()} ms)`);
    } else {
      console.log(`${ansis.blueBright.bold('-')} Nothing to clean up (${new Date().valueOf() - startTime.valueOf()} ms)`);
    }

    startTime = new Date();
    // Build library
    execSync('ng build --project=ui', { stdio: 'inherit' });

    console.log(`${ansis.greenBright.bold('✓')} Built projects/ui (${new Date().valueOf() - startTime.valueOf()} ms)`);

    // Build SCSS int CSS
    startTime = new Date();
    execSync('sass ./projects/ui/src/themes:./dist/ui/prebuilt-themes/', { stdio: 'inherit' });

    console.log(
      `${ansis.greenBright.bold('✓')} Compiled SCSS theme files into CSS (${new Date().valueOf() - startTime.valueOf()} ms)`
    );

    // Copy SCSS files to dist
    startTime = new Date();
    fs.cpSync('./projects/ui/src/themes/', './dist/ui/themes/', { recursive: true });

    console.log(
      `${ansis.greenBright.bold('✓')} Copied SCSS theme files to dist folder (${new Date().valueOf() - startTime.valueOf()} ms)`
    );

    // Publish
    execSync(`npm publish ./dist/ui --access public${isAlphaBump ? ' --tag alpha' : ''}`, {
      stdio: 'inherit',
    });

    // Cleanup
    execSync('rmdir /s /Q dist', { stdio: 'ignore' });

    console.log(
      `${ansis.greenBright.bold('✓')} Cleaned up dist directory again (${new Date().valueOf() - startTime.valueOf()} ms)`
    );

    console.log(`\n${ansis.greenBright.bold('✓')} Successfully released version ${ansis.blueBright.underline(finalVersion)}! (total duration: ${new Date().valueOf() - overallStartTime.valueOf()} ms)`);
  } catch (error) {
    console.error('Error executing release steps:', error);
    process.exit(1);
  }
})();
