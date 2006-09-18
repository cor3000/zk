/* NullWriter.java

{{IS_NOTE
	Purpose:
		
	Description:
		
	History:
		Mon May  2 16:29:13     2005, Created by tomyeh@potix.com
}}IS_NOTE

Copyright (C) 2005 Potix Corporation. All Rights Reserved.

{{IS_RIGHT
	This program is distributed under GPL Version 2.0 in the hope that
	it will be useful, but WITHOUT ANY WARRANTY.
}}IS_RIGHT
*/
package com.potix.io;

import java.io.Writer;
import java.io.IOException;

/**
 * A writer that drops all output. It hehaves like Unix /dev/null.
 *
 * @author <a href="mailto:tomyeh@potix.com">tomyeh@potix.com</a>
 */
public class NullWriter extends Writer {
	public void write(char[] cbuf, int off, int len) throws IOException {
	}
	public void flush() throws IOException {
	}
	public void close() throws IOException {
	}
}
