/* TreeModel.java

{{IS_NOTE
	Purpose:
		
	Description:
		
	History:
		Web Aug 10  2007, Created by Jeff Liu
}}IS_NOTE

Copyright (C) 2005 Potix Corporation. All Rights Reserved.

{{IS_RIGHT
	This program is distributed under GPL Version 2.0 in the hope that
	it will be useful, but WITHOUT ANY WARRANTY.
}}IS_RIGHT
*/
package org.zkoss.zul;

import org.zkoss.zul.event.TreeDataListener;

/**
 * This interface defines the methods that component like {@link Tree}
 * use to get the content of items.
 *
 */
public interface TreeModel {
	
	/**
	 * Returns true if node is a leaf.
	 * @param node - a node in the tree, obtained from this data source
	 * @return true if node is a leafs
	 */
	public boolean isLeaf(Object node);

	/**
	 * Returns the child of parent at index index in the parent's child array.
	 * @param parent - a node in the tree, obtained from this data source
	 * @return the child of parent at index index
	 */
	public Object getChild(Object parent, int index);
	
	/**
	 * Returns the number of children of parent.
	 * @param parent - a node in the tree, obtained from this data source
	 * @return the number of children of the node parent
	 */
	public int getChildCount(Object parent);
	
	/**
	 * Returns the root of the tree.
	 * @return the root of Tree.
	 */
	public Object getRoot();
	
	/**
	 * Add a listener to the tree that's notified each time a change to the data model occurs
	 * @param l - the listener to add
	 */
	public void addTreeDataListener(TreeDataListener l);
	
	/**
	 * Remove a listener to the tree that's notified each time a change to the data model occurs
	 * @param l - the listener to remove
	 */
	public void removeTreeDataListener(TreeDataListener l);
	
	/**
	 * Returns an integer array to represent the path from parent(exclusive) to lastNode(inclusive).
	 * <br>notice:<br>
	 * The path has to be in "root" to "lastNode" order<br>
	 * Ex: {1,0,2}<br>
	 * 	1. Go to the parent's child at index(1);<br>
	 *  2. Go to the index(1)'s child at index(0);<br>
	 *  3. Go to the index(0)'s child at idnex(2); -- the lastNode<br>
	 * * If parent is same as lastNode, return empty array {} 
	 * 
	 * @param parent - the origin of Path
	 * @param lastNode - the destination of Path
	 * @return an integer array to represent the path from parent to lastNode.
	 */
	public int[] getPath(Object parent, Object lastNode);
	
}
