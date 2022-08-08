import { commands, ExtensionContext, window, workspace } from 'coc.nvim';
import { URI } from 'vscode-uri';
import { Escape } from './util';

function split(arr: string[], items: Array<Array<string>> = []) {
  if (arr.length > 50) {
    const next: string[] = arr.splice(0, 50);
    items.push(next);
    split(arr, items);
  } else {
    items.push(arr);
  }
}

const resume = {
  target: '',
  replace: '',
};

export async function activate(context: ExtensionContext): Promise<void> {
  context.subscriptions.push(
    commands.registerCommand('coc-replacement.replace', async () => {
      setTimeout(async () => {
        const mode = await window.showMenuPicker(['Current File', 'Quickfix'], 'Replacement mode');
        if (mode === -1) {
          return;
        }
        let target: string = await window.requestInput('Target String', resume.target);
        if (!target) {
          return;
        }
        resume.target = target;

        let replace = '';
        replace = await window.requestInput('Replace String', resume.replace);
        if (replace === null) {
          replace = '';
          const flag = await window.showMenuPicker(['Cancel', 'Continue but empty'], 'What is next?');
          if ([0, -1].includes(flag)) {
            return;
          }
        }
        resume.replace = replace;

        const confirm = await window.showMenuPicker(['No confirm', 'Confirm'], 'With Confirming?');
        if (confirm === -1) {
          return;
        }

        if (mode === 0) {
          try {
            target = Escape.of(target)
              .removeBackslash('(')
              .removeBackslash(')')
              .removeBackslash('{')
              .removeBackslash('}')
              .removeBackslash('>')
              .removeBackslash('<').value;
            replace = Escape.of(replace)
              .removeBackslash('(')
              .removeBackslash(')')
              .removeBackslash('{')
              .removeBackslash('}')
              .removeBackslash('>')
              .removeBackslash('<').value;
            await workspace.nvim.command(`%s/${target}/${replace}/g${confirm ? 'c' : ''}`);
          } catch (e: any) {
            window.showWarningMessage(e.message);
          }
        } else if (mode === 1) {
          await workspace.nvim.command(`ccl`);
          await workspace.nvim.command(`ScrollViewDisable`);
          try {
            if (confirm) {
              target = Escape.of(target)
                .removeBackslash('(')
                .removeBackslash(')')
                .removeBackslash('{')
                .removeBackslash('}')
                .removeBackslash('>')
                .removeBackslash('<').value;
              replace = Escape.of(replace)
                .removeBackslash('(')
                .removeBackslash(')')
                .removeBackslash('{')
                .removeBackslash('}')
                .removeBackslash('>')
                .removeBackslash('<').value;
              // === 关闭缓存的
              await workspace.nvim.command(`cfdo %s/${target}/${replace}/gc | redraw | silent update | redraw | bd`);
              await workspace.nvim.command(`e# | bd#`);
              // === 不关闭缓存的
              // await workspace.nvim.command(`cfdo %s/${target}/${replace}/gc | redraw | silent update | redraw`);
              // ===
            } else {
              const list: any[] = await workspace.nvim.call('getqflist');
              // let fileNames = '';
              const fileNames = await Promise.all(
                list.map(async (item) => {
                  const { bufnr } = item;
                  const bufname = await workspace.nvim.call('bufname', bufnr);
                  const fullpath = await workspace.nvim.call('fnamemodify', [bufname, ':p']);
                  const uri = URI.file(fullpath)
                    .toString()
                    .replace(/file:\/\//g, '');
                  return decodeURIComponent(uri)
                    .replace(/\(/g, '\\(')
                    .replace(/\)/g, '\\)')
                    .replace(/\{/g, '\\{')
                    .replace(/\}/g, '\\}')
                    .replace(/\>/g, '\\>')
                    .replace(/\</g, '\\<')
                    .replace(/\u0020/g, '\\ ');
                })
              );
              const items: string[][] = [];
              const all = fileNames.filter((file, index, self) => self.findIndex((T) => T === file) === index);
              split(all, items);

              const promises = items.map((item) => {
                return workspace.runCommand(`perl -0777 -i -pe 's/${target}/${replace}/gi' ${item.join(' ')}`);
              });

              await Promise.all(promises);
              await workspace.nvim.command(`e | echo "Done!"`);
            }
          } catch (e: any) {
            window.showWarningMessage(e.message);
          }
          await workspace.nvim.command(`ScrollViewEnable`);
        } else if (mode === 2) {
          //
        }
      }, 50);
    })
  );
}
