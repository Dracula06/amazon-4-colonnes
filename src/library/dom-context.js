export function documentFor(root){
 if(!root)throw Error('Racine DOM absente');
 const doc=root.nodeType===9?root:root.ownerDocument;
 if(!doc||typeof doc.createTreeWalker!=='function')throw Error('Document DOM invalide pour le nettoyage');
 return doc;
}
